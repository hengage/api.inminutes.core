import h3 from "h3-js";

const convertLatLngToCell = (coordinates: [lng: number, lat: number]): string => {
  const h3Index = h3.latLngToCell(coordinates[1], coordinates[0], 4);
  console.log(h3Index);

  return h3Index;
};

export { convertLatLngToCell };
