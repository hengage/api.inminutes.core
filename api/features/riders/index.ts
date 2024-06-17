export { RidersService } from "./services/riders.service";
export { Rider } from "./models/riders.model";
export { ridersRoutes } from "./routes/riders.routes";
export { IRiderDocument } from "./riders.interface";

import { RidersService } from "./services/riders.service";
// import  RidersService  from "./services/riders.service";
export const ridersService = new RidersService();