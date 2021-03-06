#!/usr/bin/env node
const minimist = require("minimist");
const axios = require("axios");
const iconv = require("iconv-lite");
const showError = () => {
  console.error("Input error, please follow format");
  console.log("\x1b[31m%s\x1b[0m", "stock 601003,000001,300725,688029");
};
if (!process.argv || !process.argv.slice) {
  showError();
  return;
}
const args = minimist(process.argv.slice(2));
if (args && args["_"]) {
  const org = args["_"][0];
  if (!org) {
    showError();
    return;
  }
  const orgArr = (org + "").split(",");
  if (orgArr.length === 1) {
    let k = orgArr[0] + "";
    if (k.length < 6) {
      let now = k.length;
      while (now < 6) {
        k = "0" + k;
        now++;
      }
    }
    orgArr[0] = k;
  }
  const postArr = [];
  const varArr = [];
  orgArr.forEach((key) => {
    if (key.startsWith("6")) {
      postArr.push("sh" + key);
      varArr.push("hq_str_sh" + key);
    } else {
      postArr.push("sz" + key);
      varArr.push("hq_str_sz" + key);
    }
  });
  axios
    .get("http://hq.sinajs.cn/list=" + postArr.join(","), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "/",
      },
      responseType: "arraybuffer",
    })
    .then(function (response) {
      const map = {};
      let data = iconv.decode(response.data, "gb2312");
      data = data.replace(/var /g, "map.");
      eval(data);
      varArr.map((item) => {
        const current = map[item].split(",");
        let rate = (((current[3] - current[2]) / current[1]) * 100).toFixed(
          2
        );
        if(rate > 0){
          rate = "+ " + rate;
        }
        console.log(current[0] + ":  " + current[3]  + "  " + rate);
      });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}
