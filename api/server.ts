import dotenv from "dotenv";
dotenv.config();

import { App } from "./app/app";
import { NODE_ENV, PORT } from "./config";

const app = new App();

import h3 from "h3-js";

const h3Index = h3.latLngToCell(6.551681604304045, 3.2689173957721356, 15);
const hexCenterCoordinates = h3.cellToLatLng(h3Index);

const hexBoundary = h3.cellToBoundary(h3Index);
console.log({ h3Index, hexCenterCoordinates, hexBoundary });

app.listenToPort(PORT, NODE_ENV);
