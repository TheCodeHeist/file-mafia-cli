"use strict";

const chalk = require("chalk");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const ProgressBar = require("progress");

async function downloadFile(url, fileName) {
  console.log("Fetching metadata...");

  const { data, headers } = await axios({
    url,
    method: "get",
    responseType: "stream",
  });

  const fileSize = parseInt(headers["content-length"]);

  console.log(`Getting things ready... Starting download: ${fileName}...`);

  const progressBar = new ProgressBar(`Downloading [:bar] :percent :etas`, {
    complete: chalk.bold.bgBlueBright(" "),
    incomplete: " ",
    width: 40,
    total: parseInt(fileSize),
    renderThrottle: 1,
  });

  const fileStream = fs.createWriteStream(
    path.join(process.cwd(), "file_mafia_download.fmaf")
  );

  data.on("data", (chunk) => progressBar.tick(chunk.length));
  data.pipe(fileStream);

  fileStream.on("finish", () => {
    fs.rename("file_mafia_download.fmaf", fileName, (err) => {
      if (err) throw err;
    });

    console.log(chalk.green.bold("Download successful!"), fileName);
  });

  fileStream.on("error", (err) => {
    fs.unlink("file_mafia_download.fmaf", (err) => {
      if (err) throw err;

      console.log(chalk.red.bold("Downloading failed!"));
    });
  });
}

export async function fmafia(args) {
  const url = args[2];
  const fileName = args[3];

  if (!url || !fileName) {
    console.log("Please provide a url and a file name with file extension!");
    return;
  }

  await downloadFile(url, fileName);
}
