import h3 from "h3-js";

const convertLatLngToCell = (coordinates: [log: number, lat: number]) => {
  const h3Index = h3.latLngToCell(coordinates[1], coordinates[0], 10);
  console.log(h3Index);
  return h3Index;
};

export { convertLatLngToCell };
