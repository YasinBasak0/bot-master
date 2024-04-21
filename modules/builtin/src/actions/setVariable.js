/**
 * Store data to desired storage based on the time to live expectation. Read the
 * documentation for more details
 *
 * @title Set Variable
 * @category Storage
 * @author Terzion A.Ş.
 * @param {string} type - Pick between: user, session, temp, bot
 * @param {string} name - The name of the variable
 * @param {any} value - Set the value of the variable. Type 'null' or leave empty to erase it.
 */
const setVariable = async (type, name, value) => {
  if (type === 'bot') {
    const original = await bp.kvs.forBot(event.botId).get('global')
    await bp.kvs.forBot(event.botId).set('global', { ...original, [name]: value })
  } else if (value === 'null' || value === '' || typeof value === 'undefined') {
    delete event.state[type][name]
  } else {
    event.state[type][name] = value
  }
}

return setVariable(args.type, args.name, args.value)
