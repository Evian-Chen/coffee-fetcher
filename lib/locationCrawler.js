import axios from "axios";
import * as cheerio from "cheerio";

let URL =
  "https://byronhu.wordpress.com/2013/09/09/%E5%8F%B0%E7%81%A3%E7%B8%A3%E5%B8%82%E7%B6%93%E7%B7%AF%E5%BA%A6/";

export async function getLoactions() {
  try {
    const response = await axios.get(URL);
    const html = response.data;

    const $ = cheerio.load(html);
    const data = $("tbody").text().trim().split(/\s+/);
    const locations = {};

    for (let i = 0; i < data.length; i += 3) {
      locations[data[i]] = [data[i + 2], data[i + 1]];
    }

    return locations;
  } catch (err) {
    console.log("location error: ", err);
    return {};
  }
}
