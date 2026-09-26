export class HttpRequestError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "HttpRequestError"
    this.status = status
  }
}

export async function call<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(joinUrl(baseUrl, path), {
    method,
    headers:
      body === undefined
        ? undefined
        : {
            "Content-Type": "application/json",
          },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const value = text === "" ? null : parseJson(text)

  if (!response.ok) {
    throw new HttpRequestError(response.status, readErrorMessage(value, text))
  }

  return value as T
}

export async function* streamCall<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown,
): AsyncGenerator<T> {
  const response = await fetch(joinUrl(baseUrl, path), {
    method,
    headers:
      body === undefined
        ? undefined
        : {
            "Content-Type": "application/json",
          },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    const value = text === "" ? null : parseJson(text)
    throw new HttpRequestError(response.status, readErrorMessage(value, text))
  }

  if (response.body === null) {
    throw new Error("response body is null")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })

    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      if (line.trim() === "") continue
      yield JSON.parse(line) as T
    }

    if (done) break
  }

  if (buffer.trim() !== "") {
    yield JSON.parse(buffer) as T
  }
}

export async function callOptional<T>(
  baseUrl: string,
  method: string,
  path: string,
): Promise<T | undefined> {
  try {
    return await call<T>(baseUrl, method, path)
  } catch (error) {
    if (error instanceof HttpRequestError && error.status === 404) {
      return undefined
    }

    throw error
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function readErrorMessage(value: unknown, text: string): string {
  if (value !== null && typeof value === "object") {
    const error = (value as { error?: unknown }).error
    if (error !== null && typeof error === "object") {
      const message = (error as { message?: unknown }).message
      if (typeof message === "string") return message
    }
  }

  return text
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path}`
}

export function withQuery(path: string, query: URLSearchParams): string {
  const text = query.toString()
  return text === "" ? path : `${path}?${text}`
}
