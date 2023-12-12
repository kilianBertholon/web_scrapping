const puppeteer = require('puppeteer');
const fs = require('fs');

const url = 'https://redscores.com/fr/football-stats';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 920 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  let currentPage = 1;
  const maxPages = 299; // ou tout autre nombre maximal de pages que tu souhaites scraper

  await page.waitForTimeout(5000); // Attend un peu pour que la nouvelle page se charge (ajuste si nécessaire)
  while (currentPage <= maxPages) {
    const rows = await page.$$('tbody > tr');
    const result = [];

    for (const row of rows) {
      const rowData = await row.$$eval('td.text-center', cells => {
        return cells.map(cell => cell.innerText.trim());
      });
    
      const rank = rowData[0];
      const nom = await row.$eval('.rank-table__body__top span.text-nowrap', span => span.innerText);
      const info = await row.$eval('.rank-table__body__bottom span.text-nowrap', span => span.innerText);
      const minJ = rowData[1];
      const CartonJaune = rowData[2];
      const But = rowData[3];
      const PasseDecisive = rowData[4];
      const Note = rowData[5];
      const Tirs = rowData[6];
      const Dribbles = rowData[7];
      const Passes_perc = rowData[8];
      const moy_passes = rowData[9];
      const centre_perc = rowData[10];
      const degagement = rowData[11];
      const interception = rowData[12];
      const tacle = rowData[13];
      const tirsBloques = rowData[14];
      const driblesSubis = rowData[15];
      const fautes = rowData[16];
      const TaclesRecu = rowData[17];
      const HorsJeu = rowData[18];
    
      // Ajoute les données de la ligne au tableau résultat
      result.push({ rank, nom, info, minJ, CartonJaune, But, PasseDecisive, Note, Tirs, Dribbles, Passes_perc, moy_passes, centre_perc, degagement, interception, tacle, tirsBloques, driblesSubis, fautes, TaclesRecu, HorsJeu });
    }

    // Fais quelque chose avec le tableau de données extraites
    console.log(result);

    // Passe à la page suivante
    const nextPageButton = await page.$('.pagination__button.next .pagination__link');
      if (nextPageButton) {
        await nextPageButton.click();
        await page.waitForTimeout(2000); // Attend un peu pour que la nouvelle page se charge (ajuste si nécessaire)
      } else {
        console.log('Pas de page suivante disponible. Fin du scraping.');
        break; // Arrête la boucle si aucune page suivante n'est disponible
      }


    currentPage++;
      // Écrit le tableau résultat dans un fichier JSON
    fs.appendFile('resultat_football.json', JSON.stringify(result, null, 2), (err) => {
      if (err) throw err;
      console.log('Les données ont été écrites dans le fichier resultat_football.json');
  });
  }
  await browser.close();
})();