import { Migrations } from "shared/documentservice/DocumentService.Types";

const Migrations = [
  {
    backwardsCompatible: true,
    migrate: (d) => {
      return d;
    },
  },
] satisfies Migrations;

export default Migrations;
