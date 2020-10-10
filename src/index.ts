import * as core from "@actions/core";
import * as AWS from "aws-sdk";
import * as fs from "fs";
import { lookup } from "mime-types";

async function run() {
  const BUCKET_NAME = core.getInput("aws_bucket", { required: true });
  const SOURCE_PATH = core.getInput("source_path", { required: true });
  const DESTINATION_PATH = core.getInput("destination_path", {
    required: false,
  });

  const s3 = new AWS.S3({
    accessKeyId: core.getInput("aws_access_key_id", { required: true }),
    secretAccessKey: core.getInput("aws_secret_access_key", { required: true }),
  });

  const fileStream = fs.createReadStream(SOURCE_PATH);
  const params = {
    Bucket: BUCKET_NAME,
    Body: fileStream,
    Key: DESTINATION_PATH,
    ContentType: lookup(SOURCE_PATH) || "text/plain",
  };

  return await s3.putObject(params).promise();
}

run()
  .then((upload) => {
    core.setOutput("objectVersion", upload.VersionId);
  })
  .catch((err) => {
    core.error(err);
    core.setFailed(err.message);
  });
