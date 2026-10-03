import type { z } from "zod"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type HttpClientConfig = {
  baseUrl: string
  key: string
}

export type JsonEndpointOptions<Input, Output> = {
  method: HttpMethod
  path: string | ((input: Input) => string)
  query?: (input: Input) => URLSearchParams
  body?: (input: Input) => unknown
  output: z.ZodType<Output>
  headers?: Headers | ((input: Input) => Headers)
}

export type JsonEndpoint<Input, Output> = (input?: Input) => Promise<Output>

export function makeJsonEndpoint<Input, Output>(
  config: HttpClientConfig,
  options: JsonEndpointOptions<Input, Output>,
): JsonEndpoint<Input, Output> {
  return async (input?: Input) => {
    const path =
      typeof options.path === "function"
        ? options.path(input as Input)
        : options.path

    const body = options.body?.(input as Input)
    const url = makeUrl(config.baseUrl, path, options.query?.(input as Input))

    const endpointHeaders =
      typeof options.headers === "function"
        ? options.headers(input as Input)
        : options.headers

    const headers = mergeHeaders(
      new Headers({
        Accept: "application/json",
      }),
      endpointHeaders,
    )

    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    const text = await response.text()
    const endpoint = `${options.method} ${path}`

    if (!response.ok) {
      throw new JsonEndpointError({
        endpoint,
        url,
        status: response.status,
        detail: text,
      })
    }

    let value: unknown

    try {
      value = text === "" ? null : JSON.parse(text)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new JsonEndpointError({
        endpoint,
        url,
        detail: `invalid JSON: ${message}`,
      })
    }

    const result = options.output.safeParse(value)
    if (!result.success) {
      throw new JsonEndpointError({
        endpoint,
        url,
        detail: `invalid response: ${result.error.message}`,
      })
    }

    return result.data
  }
}

export type JsonEndpointErrorOptions = {
  endpoint: string
  url: string
  status?: number
  detail: string
}

export class JsonEndpointError extends Error {
  endpoint: string
  url: string
  status: number | undefined
  detail: string

  constructor(options: JsonEndpointErrorOptions) {
    const status = options.status === undefined ? "" : ` HTTP ${options.status}`

    super(`${options.endpoint}${status}: ${options.detail}`)
    this.name = "JsonEndpointError"
    this.endpoint = options.endpoint
    this.url = options.url
    this.status = options.status
    this.detail = options.detail
  }
}

function makeUrl(
  baseUrl: string,
  path: string,
  query: URLSearchParams | undefined,
): string {
  const base = baseUrl.replace(/\/+$/, "")
  const suffix = path.startsWith("/") ? path : `/${path}`
  const url = `${base}${suffix}`
  const queryText = query?.toString() ?? ""

  return queryText === "" ? url : `${url}?${queryText}`
}

function mergeHeaders(...sources: Array<Headers | undefined>): Headers {
  const headers = new Headers()

  for (const source of sources) {
    if (source === undefined) continue

    source.forEach((value, key) => {
      headers.set(key, value)
    })
  }

  return headers
}
