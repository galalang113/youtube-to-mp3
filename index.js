const express = require("express");
const path = require("path");
const FormData = require("form-data");
const app = express();
const port = process.env.PORT || 3001;
const got = require("got");

const fetch = require("node-fetch");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

app.use(express.static(path.join(__dirname, "public")));

const filterSelected = function (dataJSON) {
  for (let mp3 of Object.keys(dataJSON.links["mp3"])) {
    if (dataJSON.links["mp3"][mp3].selected === "selected") {
      return dataJSON.links["mp3"][mp3];
    }
  }
  return null;
};

const dataFromY2mate = async function (link) {
  try {
    let data = new FormData();
    data.append("query", link);
    data.append("vt", "mp3");

    let requestOptions = {
      method: "POST",
      body: data,
      redirect: "follow",
    };
    const resp = await fetch("https://tomp3.cc/api/ajax/search", {
      ...requestOptions,
      agent: httpsAgent,
    });
    const dataJSON = await resp.json();
    return dataJSON;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const getLinkDownloadY2mate = async function (data) {
  try {
    let formdata = new FormData();
    formdata.append("vid", data.vid);
    formdata.append("k", data.k);

    let requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };
    const resp = await fetch("https://tomp3.cc/api/ajax/convert", {
      ...requestOptions,
      agent: httpsAgent,
    });
    const dataJSON = await resp.json();
    return dataJSON;
  } catch (error) {
    console.error(error);
    return {};
  }
};

app.get("/download", express.json(), async (req, res) => {
  try {
    got.stream(req.query.link).pipe(res);
  } catch (error) {
    res.json({ error: true });
  }
});

app.post("/yt-to-mp3", express.json(), async (req, res) => {
  try {
    const dataJSON = await dataFromY2mate(req.body.link);

    let vid = dataJSON.vid;
    let selected = filterSelected(dataJSON);

    let result = await getLinkDownloadY2mate({ vid, k: selected.k });
    res.json({ error: false, ...result });
  } catch (error) {
    res.json({ error: true });
  }
});

app.listen(port, function () {
  console.log("App listening on port", port);
});
