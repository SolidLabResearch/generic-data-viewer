import config from "./webpack.config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default Object.assign(config, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    port: "3000",
    static: { directory: path.join(__dirname, "./public") },
    open: true,
    hot: true,
    liveReload: true,
  },
});