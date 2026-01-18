import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const config: OpenNextConfig = {
  default: {
    backend: {
      default: {
        minify: true,
        placement: "global",
        method: "individual",
      },
    },
  },
  infrastructure: {
    external: {
      sqlite3: "force-include",
      mysql2: "force-include",
      pg: "force-include",
      "pg-hstore": "force-include",
      sequelize: "force-include",
    },
  },
};

export default config;
