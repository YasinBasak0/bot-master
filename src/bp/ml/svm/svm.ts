import _ from 'lodash'
import assert from 'assert'
import numeric from 'numeric'

import BaseSVM from './addon'
import gridSearch from './grid-search'
import { normalizeDataset, normalizeInput } from './normalize'
import reduce from './reduce-dataset'
import { SvmConfig, Data, SvmModel, Report } from './typings'
import { defaultConfig, checkConfig } from './config'

export class SVM {
  private _config: SvmConfig
  private _baseSvm: BaseSVM | undefined
  private _retainedVariance: number = 0
  private _retainedDimension: number = 0
  private _initialDimension: number = 0

  constructor(config: Partial<SvmConfig>, model?: SvmModel) {
    this._config = { ...checkConfig(defaultConfig(config)) }
    if (model) {
      this._restore(model)
    }
  }

  private _restore = (model: SvmModel) => {
    const self = this
    this._baseSvm = BaseSVM.restore(model)
    Object.entries(model.param).forEach(([key, val]) => {
      self._config[key] = val
    })
  }

  train = async (dataset: Data[], progressCb: (progress: number) => void) => {
    const self = this
    const dims = numeric.dim(dataset)
    assert(dims[0] > 0 && dims[1] === 2 && dims[2] > 0, 'dataset must be an list of [X,y] tuples')

    if (!this._config.normalize) {
      this._config.mu = Array(dims[2]).fill(0)
      this._config.sigma = Array(dims[2]).fill(0)
    } else {
      const norm = normalizeDataset(dataset)
      this._config.mu = norm.mu
      this._config.sigma = norm.sigma
      dataset = norm.dataset
    }

    if (!this._config.reduce) {
      this._config.u = numeric.identity(dims[2])
      this._retainedVariance = 1
      this._retainedDimension = dims[2]
      this._initialDimension = dims[2]
    } else {
      const red = reduce(dataset, this._config.retainedVariance)
      this._config.u = red.U
      this._retainedVariance = red.retainedVariance
      this._retainedDimension = red.newDimension
      this._initialDimension = red.oldDimension
      dataset = red.dataset
    }

    const { params, report } = await gridSearch(dataset, this._config, progress => {
      progressCb(progress.done / (progress.total + 1))
    })

    self._baseSvm = new BaseSVM()
    return self._baseSvm.train(dataset, params).then(function(model) {
      progressCb(1)
      const fullModel: SvmModel = { ...model, param: { ...self._config, ...model.param } }

      const fullReport: Report = {
        ...report,
        reduce: self._config.reduce,
        retainedVariance: self._retainedVariance,
        retainedDimension: self._retainedDimension,
        initialDimension: self._initialDimension
      }
      return { model: fullModel, report: fullReport }
    })
  }

  isTrained = () => {
    return !!this._baseSvm ? this._baseSvm.isTrained() : false
  }

  predict = (x: number[]) => {
    assert(this.isTrained())
    return (this._baseSvm as BaseSVM).predict(this._format(x))
  }

  predictSync = (x: number[]) => {
    assert(this.isTrained())
    return (this._baseSvm as BaseSVM).predictSync(this._format(x))
  }

  predictProbabilities = (x: number[]) => {
    assert(this.isTrained())
    return (this._baseSvm as BaseSVM).predictProbabilities(this._format(x))
  }

  predictProbabilitiesSync = (x: number[]) => {
    assert(this.isTrained())
    return (this._baseSvm as BaseSVM).predictProbabilitiesSync(this._format(x))
  }

  private _format = (x: number[]) => {
    const mu = this._config.mu as number[]
    const sigma = this._config.sigma as number[]
    const u = this._config.u as number[][]
    const xNorm = normalizeInput(x, mu, sigma)
    return numeric.dot(xNorm, u) as number[]
  }
}
