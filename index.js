const express = require('express');
const fs = require('fs');

const app = express();

const port = 8080;

app.use(express.static('public'));
app.use(express.json());

app.listen(port, () => {

  console.log(`Example app listening on port ${port}`);

});

app.post('/update-custom', (req, res) => {
  fs.readFile('./public/json/custom.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return res.status(500).send('Error al leer el archivo JSON');
    }

    let json = JSON.parse(data);

    if (json.playList.length >= 9) {
      res.send("Límite de ejercicios alcanzado");
    } 
    else {
      if (json.playList.length > 0) {
        json.playList.push({ "key": "Descanso" });
      }
      json.playList.push(req.body.newExercise);

      fs.writeFile('./public/json/custom.json', JSON.stringify(json), 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir en el archivo JSON:', err);
          return res.status(500).send('Error al escribir en el archivo JSON');
        }

        res.send('Archivo JSON actualizado exitosamente');
      });
    }
  });
});

app.post('/delete-custom', (req, res) => {
  fs.readFile('./public/json/custom.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return res.status(500).send('Error al leer el archivo JSON');
    }
    let json = JSON.parse(data);

    json.playList.splice(req.body.i, 1);

    if (req.body.i > 0) {
      json.playList.splice(req.body.i - 1, 1);
    }


    fs.writeFile('./public/json/custom.json', JSON.stringify(json), 'utf8', (err) => {
      if (err) {
        console.error('Error al escribir en el archivo JSON:', err);
        return res.status(500).send('Error al escribir en el archivo JSON');
      }

      res.send('Archivo JSON actualizado exitosamente');
    });
  });
});
