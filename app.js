const linebot = require("linebot");

const bot = linebot({
  channelId: "1653725314",
  channelSecret: "016b331bd069cde23e44b6ff59a28e1b",
  channelAccessToken:
    "3rEG8Jy2yMhAFOCF14ZU55Kpp6DCziEhVEnF7U14j7kSK8ql+gJPZwr8vHdmXtP2Pzq7u4+i9AK/ppamYwd2O4pYl4PxPVMwPdtqCxUKYYTZVyjSFklrCRNd+ljgxC6IZ6LRoAjzozkllJzGt6MmkwdB04t89/1O/w1cDnyilFU"
});

const HomeAssistant = require("homeassistant");
const hass = new HomeAssistant({
  host: "http://114.34.163.98",
  port: 8123,
  token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJlNmNmNGI4ZjRlNWM0ZDIzYWRjODQ1YzhiYjllYWU0NCIsImlhdCI6MTU3ODE1NTQ5OSwiZXhwIjoxODkzNTE1NDk5fQ.lp2L6rDhasXa94hEHVXHEK40NYROc37pAPx5i-tkivY",
  // Ignores SSL certificate errors, use with caution
  // Optional, defaults to false
  ignoreCert: true
});

const express = require("express");
const app = express();
const linebotParser = bot.parser();
app.post("/linewebhook", linebotParser);

const https = require("https");
const fs = require("fs");

bot.on("message", event => {
  //console.log(event);
  switch (event.message.type) {
    case "text":
      switch (event.message.text) {
        case "開門":
          event.reply({
            type: "template",
            altText: "開門選項確認訊息框",
            template: {
              type: "confirm",
              text: "要開哪一個門",
              actions: [
                {
                  type: "message",
                  label: "樓上門",
                  text: "開樓上門"
                },
                {
                  type: "message",
                  label: "樓下門",
                  text: "開樓下門"
                }
              ]
            }
          });
          break;
        case "開樓上門":
          event
            .reply("完成")
            .then(function(data) {
              hass.services.call("toggle", "switch", {
                entity_id: "switch.updooropener_2"
              });
              console.log("Success", data);
              console.log(hass.status());
            })
            .catch(function(error) {
              console.log("Error", error);
            });
          break;
        case "開樓下門":
          event
            .reply("完成")
            .then(function(data) {
              hass.services.call("toggle", "switch", {
                entity_id: "switch.downdooropener"
              });
              console.log("Success", data);
              console.log(hass.status());
            })
            .catch(function(error) {
              console.log("Error", error);
            });
          break;
        case "嗨":
          event.source.profile().then(function(profile) {
            return event.reply(profile.displayName + "你是白痴是嗎");
          });
          break;
        default:
          break;
      }
      break;
    case "image":
      event.message
        .content()
        .then(function(data) {
          return event.reply("這三小");
        })
        .catch(function(err) {
          return event.reply(err.toString());
        });
      break;
    default:
      event.reply("Unknow message: " + JSON.stringify(event));
      break;
  }
});

bot.on("join", function(event) {
  if (event.source.groupId) {
    event.reply("你好 各位垃圾");
  }
  if (event.source.roomId) {
    event.reply("你好 各位垃圾");
  }
});

bot.on("leave", function(event) {
  if (event.source.groupId) {
    console.log("leave group: " + event.source.groupId);
  }
  if (event.source.roomId) {
    console.log("leave room: " + event.source.roomId);
  }
});

bot.on("memberJoined", function(event) {
  event.source.profile().then(function(profile) {
    if (event.source.type === "group") {
      event.reply("嗨 垃圾");
    }
    if (event.source.type === "room") {
      event.reply("嗨 垃圾");
    }
  });
});

bot.on("memberLeft", function(event) {
  event.reply("掰掰垃圾");
});

app.listen(process.env.PORT || 80, function() {
  console.log("LineBot is running.");
});

https
  .createServer(
    {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem")
    },
    app
  )
  .listen(443, function() {
    console.log("LineBot listening on port 443! Go to https://localhost:443/");
  });
