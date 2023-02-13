const express = require('express')
const fs = require('fs')
const path = require('node:path')

const { PDFNet } = require('@pdftron/pdfnet-node')
const { fileURLToPath } = require('url')
const app = express()

app.get('/', (req, res) => {
  const fileName = 'layout.docx'

  const inputPath = path.resolve(__dirname, `../assets/${fileName}`)
  const outputPath = path.resolve(__dirname, `../assets/${fileName}.pdf`)

  console.log({ inputPath, outputPath })

  const convertToPDF = async () => {
    const pdfdoc = await PDFNet.PDFDoc.create()

    await pdfdoc.initSecurityHandler()
    await PDFNet.Convert.toPdf(pdfdoc, inputPath)
    pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized)
  }

  PDFNet.runWithCleanup(
    convertToPDF,
    'demo:1675802871498:7d298a4a0300000000c48e279067e8aee92f122c9ac414a0e57fafc246',
  )
    .then(() => {
      fs.readFile(outputPath, (err, data) => {
        if (err) {
          res.statusCode = 500
          res.end(err)
        } else {
          res.setHeader('ContentType', 'application/pdf')
          res.end(data)
        }
      })
    })
    .catch(err => {
      res.statusCode = 500
      res.end(err)
    })
})

app.get('/replace', (req, res) => {
  const fileName = 'layout.pdf'

  const inputPath = path.resolve(__dirname, `../assets/${fileName}`)
  const outputPath = path.resolve(__dirname, `../assets/${fileName}.pdf`)

  const convertToPDF = async () => {
    const pdfdoc = await PDFNet.PDFDoc.createFromFilePath(inputPath)

    await pdfdoc.initSecurityHandler()

    const replacer = await PDFNet.ContentReplacer.create()

    const page = await pdfdoc.getPage(1)

    await replacer.addString('username', 'Elioenay Rodrigues da Silva')
    await replacer.addString('eventname', 'Semana Acadêmica')
    await replacer.addString('dtStart', '15/02/2023')
    await replacer.addString('dtEnd', '15/02/2023')
    await replacer.addString('participationType', 'Participante')
    await replacer.addString('qtdHours', '4')

    await replacer.process(page)

    pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized)
  }

  PDFNet.runWithCleanup(
    convertToPDF,
    'demo:1675802871498:7d298a4a0300000000c48e279067e8aee92f122c9ac414a0e57fafc246',
  )
    .then(async () => {
      await PDFNet.shutdown()

      fs.readFile(outputPath, (err, data) => {
        if (err) {
          res.statusCode = 500
          res.end(err)
        } else {
          res.setHeader('ContentType', 'application/pdf')
          res.end(data)
        }
      })
    })
    .catch(err => {
      res.statusCode = 500
      res.end(err)
    })
})

app.listen(3030, () => {
  console.log('running')
})
