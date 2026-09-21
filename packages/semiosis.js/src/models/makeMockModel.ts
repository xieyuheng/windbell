import type { Model, ModelInput, ModelOutput } from "../model/index.ts"

export type MockModel = Model & {
  inputs: Array<ModelInput>
  step: number
}

export function makeMockModel(outputs: Array<ModelOutput>): MockModel {
  if (outputs.length === 0) {
    throw new Error("[makeMockModel] outputs must not be empty")
  }

  const model: MockModel = {
    inputs: [],
    step: 0,
    interpret: async (input) => {
      model.inputs.push(input)

      const output = outputs[model.step]
      if (output === undefined) {
        throw new Error("[makeMockModel] no more outputs")
      }

      model.step += 1
      return output
    },
  }

  return model
}
