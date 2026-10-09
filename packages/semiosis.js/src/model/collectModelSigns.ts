import type { Sign } from "../sign/index.ts"
import type { Model, ModelInterpretOptions } from "./Model.ts"

export async function collectModelSigns(
  model: Model,
  input: Array<Sign>,
  options: ModelInterpretOptions = {},
): Promise<Array<Sign>> {
  const signs: Array<Sign> = []

  for await (const event of model.interpret(input, options)) {
    if (event.type === "sign") {
      signs.push(event.sign)
    }
  }

  return signs
}
