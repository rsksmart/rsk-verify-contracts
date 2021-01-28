const { verifyParams, Verifier, isVerified } = require('@rsksmart/rsk-contract-verifier')
const { getFile } = require('./files')
const { red, green, reset, icons } = require('@rsksmart/rsk-js-cli')
const { isAddress } = require('@rsksmart/rsk-utils')

async function verify (file, { fileIndex, files, config } = {}) {
  try {
    let content = await getFile(file)
    content = JSON.parse(content)
    const { address, name, net } = content
    if (!isAddress(address)) throw new Error(`invalid address: ${address}`)
    if (!net || !net.id) throw new Error('Missing net data')
    if (!name) throw new Error('Missing contract name')
    const num = (files) ? `${fileIndex}/${files}` : `${fileIndex || ''}`
    let info = num ? `${num} - ` : ''
    info = `${info}${address} @ ${net.id}-${net.name} :: ${name}`
    const start = Date.now()
    const { result, error } = await verifyContract(content, config)
    const icon = (!error) ? icons.ok : icons.error
    const color = (!error) ? green : red
    const time = Math.floor((Date.now() - start) / 1000)
    const msg = `${color}${info} ${icon} (${time}s) ${reset}`
    const tryThis = (error && result && result.tryThis) ? result.tryThis : undefined
    return { error, result, time, msg, tryThis }
  } catch (err) {
    return Promise.reject(err)
  }
}

async function verifyContract (content, config) {
  let result
  const verifier = Verifier(config)
  try {
    result = await verifyParams(content, verifier)
    if (!isVerified(result)) throw new Error('Verification failed')
    return { result }
  } catch (error) {
    return { error, result }
  }
}

function validatePayload (payload) {
}

module.exports = { verify, verifyContract, validatePayload }