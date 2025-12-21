const app = require('./app')
const PORT = 3000
const port = process.env.PORT || PORT  

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

