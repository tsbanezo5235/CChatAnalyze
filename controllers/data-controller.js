const fs = require('fs');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const nodejieba = require('nodejieba');
const zlib = require('zlib');

let dataArray = []
let testUndefined;

const streamPromise = new Promise((resolve, reject) => {
  fs.createReadStream('./sources/C_Chat-10626-17626.json.gz')
      .pipe(zlib.createGunzip())
      .pipe(JSONStream.parse('articles.*',(map) => {
        return {
          key: map.article_id,
          title: map.article_title,
          author: map.author,
          content: map.content,
          time: map.date,
          messages: map.message_count,
        }
      }))
      .pipe(es.mapSync( (data) => {
        dataArray.push(data);
      }))
      .on('end', () => resolve(() => console.log('hey! read data end.')))  
})

const giveWashData = async (req, res, next) => {
  await streamPromise;

  const washedData = dataArray.map(article => {
    return {
      key: article.key,
      title: article.title,
      author: article.author,
      content: article.content,
      time: Date.parse(article.time),
      messages: article.messages,
    }
  });
  const { name, keyword } = req.body;
  const selectData = washedData.filter((article) => {
    if (article.title === testUndefined) {
      return false
    } else if (article.title !== null && article.title.includes(keyword)) {
      return true
    } else if (article.title !== null && article.title.includes(name)) {
      return true
    } else {
      return false
    }
  })

  res.json(selectData)
  console.log(selectData.length)
};

const wordCloudData = async (req, res, next) => {
  console.log("hey! start!")
  await streamPromise;

  const washedData = dataArray.map(article => {
    return {
      key: article.key,
      title: article.title,
      author: article.author,
      content: article.content,
      time: Date.parse(article.time),
      messages: article.messages,
    }
  });
  console.log(washedData.length)
  const { name, keyword } = req.body;
  const selectData = washedData.filter((article) => {
    if (article.title === testUndefined) {
      return false
    } else if (article.title !== null && article.title.includes(keyword)) {
      return true
    } else if (article.title !== null && article.title.includes(name)) {
      return true
    } else {
      return false
    }
  })

  const selectContent = []
  selectData.forEach(article => {
    selectContent.push(article.content);
  });
  
  const assembleContent = selectContent.join('')
  const wordCloudNumber = 120;
  nodejieba.load({
    userDict:'./sources/dict.txt'
  });
  const wordCloudRank = nodejieba.extract(assembleContent, wordCloudNumber);
  const adaptedWordCloudRank = wordCloudRank.map((wordRank) => {
    return {
      text: wordRank.word,
      value: wordRank.weight
    }
  })
  res.json(adaptedWordCloudRank);
};

exports.giveWashData = giveWashData;
exports.wordCloudData = wordCloudData;
