const bcrypt = require('bcryptjs')

async function salt() {
  const salted = await bcrypt.genSalt(10)
  return salted
}
module.exports = salt
