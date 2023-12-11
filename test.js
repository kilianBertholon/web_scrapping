const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://dataride.uci.ch/iframe/RankingDetails/171?disciplineId=1&groupId=20&momentId=171922&disciplineSeasonId=418&rankingTypeId=1&categoryId=22&raceTypeId=0';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1680, height: 920 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  const dropdownButton = await page.$('span.k-select[aria-label="select"]');

  if (dropdownButton) {
    await dropdownButton.click(); // Clique sur le bouton pour afficher la barre déroulante

  // Attend un peu pour que la page se mette à jour après l'ouverture de la barre déroulante
    await page.waitForTimeout(5000); // Ajuste si nécessaire
  } else {
    console.log('Le bouton pour ouvrir la barre déroulante n\'a pas été trouvé.');
  }

  let currentPage = 1;
  const maxPages = 7; // ou tout autre nombre maximal de pages que tu souhaites scraper

  await page.waitForTimeout(5000); // Attend un peu pour que la nouvelle page se charge (ajuste si nécessaire)
  while (currentPage <= maxPages) {
    const list_lignes = await page.$$('tr.k-master-row');
    const result = [];
  
    for (const ligne of list_lignes) {
      const nom = await page.evaluate(el => {
        if (el) {
          return el.innerText;
        }
        return '';
      }, ligne);
  
      if (nom.classement === '') {
        continue;
      }
  
      const parts = nom.split('\n');
      const cleanPart = parts.map(part => part.trim());
      const classement = cleanPart[0].split('\t')[0]; 

  
      result.push({
        classement,
        nom: cleanPart[1],
        pays: cleanPart[2],
        age: cleanPart[3],
        Pts: cleanPart[4],
      });
    }
  
    const nextPageButton = await page.$('[title="Go to the next page"]'); // Met le sélecteur approprié
    if (nextPageButton) {
      await nextPageButton.click();
      await page.waitForTimeout(2000); // Attend un peu pour que la nouvelle page se charge (ajuste si nécessaire)
    } else {
      console.log('Pas de page suivante disponible. Fin du scraping.');
      break; // Ajoutez cette ligne pour sortir de la boucle si la page suivante n'est pas disponible
    }
  
    console.log(result);
  
    fs.writeFile(`data_bmx_2009_page_${currentPage}.json`, JSON.stringify(result, null, 2), (err) => {
      if (err) throw err;
      console.log(`Les données de la page ${currentPage} ont été écrites dans le fichier data_bmx_2023_page_${currentPage}`);
    });
  
    currentPage++;
    // return result; // Retiré car cela causerait la sortie de la fonction dès la première itération
  }
  
  await browser.close();
})();