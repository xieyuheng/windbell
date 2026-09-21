import type { Model, ModelInput, ModelOutput } from "../model/index.ts"

export type MockModel = Model & {
  inputs: Array<ModelInput>
  step: number
}

export type MockModelOptions = {
  repeatLast?: boolean
}

export function makeMockModel(
  outputs: Array<ModelOutput>,
  options: MockModelOptions = {},
): MockModel {
  if (outputs.length === 0) {
    throw new Error("[makeMockModel] outputs must not be empty")
  }

  const model: MockModel = {
    inputs: [],
    step: 0,
    interpret: async (input) => {
      model.inputs.push(input)

      const finished = model.step >= outputs.length
      if (finished && options.repeatLast !== true) {
        throw new Error("[makeMockModel] no more outputs")
      }

      const index = finished ? outputs.length - 1 : model.step
      const output = outputs[index]
      if (output === undefined) {
        throw new Error("[makeMockModel] output is missing")
      }

      model.step += 1
      return output
    },
  }

  return model
}
