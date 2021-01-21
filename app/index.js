import { scrapeDetailPage } from './scrapers/detail.js';
import { scrapeListPage } from './scrapers/list.js';
import express from 'express';
import ObjectsToCsv from 'objects-to-csv';

const app = express();
app.use(express.json());
app.use(express.static('static'));

app.get('/download', async (req, res) => {
  const { url } = req.query;
  const detailUrls = await scrapeListPage(url);
  console.log(detailUrls);
  const data = [];
  for (let i = 0; i < 5; i++) {
    data.push(await scrapeDetailPage(detailUrls[i]));
    console.log(detailUrls[i]);
  }
  const csv = new ObjectsToCsv(data);
  res.contentType('text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bbs-export.csv');
  res.status(200).send(await csv.toString());
});

app.listen(process.env.PORT || 3000, () => {
  console.info('listening');
});
