const faunadb = require('faunadb')
const readline = require('readline-promise').default

const { Map, Collections, Documents, Paginate, Lambda, Functions, Roles, Indexes, Delete, Var, Tokens } = faunadb.query

const keyQuestion = `----- Please provide the FaunaDB admin key) -----
An admin key is powerful, it should only be used for the setup script, not to run your application!
At the end of the script a key with limited privileges will be returned that should be used to run your application
Enter your key:`

const main = async () => {
  let serverKey = ''
  const interactiveSession = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  await interactiveSession.questionAsync(keyQuestion).then(key => {
    serverKey = key
    interactiveSession.close()
  })
  const client = new faunadb.Client({ secret: serverKey })
  return deleteAll(client)
}

const deleteAll = async client => {
  try {
    const collections = await deleteAllCollections(client)
    const functions = await deleteAllFunctions(client)
    const roles = await deleteAllRoles(client)
    const indexes = await deleteIndexes(client)
    const tokens = await deleteTokens(client)

    console.log(`Deleted:
1. collections: ${collections.data.length}
2. functions: ${functions.data.length}
3. roles: ${roles.data.length},
4. indexes: ${indexes.data.length},
5. tokens: ${tokens.data.length}`)
  } catch (err) {
    console.log('Error', err)
  }
}

const deleteAllCollections = async client => {
  return client.query(Map(Paginate(Collections()), Lambda('ref', Delete(Var('ref')))))
}

const deleteAllFunctions = async client => {
  return client.query(Map(Paginate(Functions()), Lambda('ref', Delete(Var('ref')))))
}

const deleteAllRoles = async client => {
  return client.query(Map(Paginate(Roles()), Lambda('ref', Delete(Var('ref')))))
}

const deleteIndexes = async client => {
  return client.query(Map(Paginate(Indexes()), Lambda('ref', Delete(Var('ref')))))
}

const deleteTokens = async client => {
  return client.query(Map(Paginate(Documents(Tokens())), Lambda('ref', Delete(Var('ref')))))
}

main()
