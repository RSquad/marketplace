const fs = require("fs");
const shell = require("shelljs");

if (!shell.which("git")) {
  shell.echo("Sorry, this script requires git");
  shell.exit(1);
}

const smcNames = ["NftRoot", "NFT", "NftBase", "NftBuySell"];

const compileScripts = [];

smcNames.forEach((name) => {
  compileScripts.push(`npx tondev sol compile ./src/smc/NFT/${name}.sol`);
  compileScripts.push(
    `mv ./src/smc/NFT/${name}.abi.json ./sbin/${name}.abi.json`
  );
  compileScripts.push(`mv ./src/smc/NFT/${name}.tvc ./sbin/${name}.tvc`);
});

compileScripts.forEach((script) => {
  shell.exec(script);
});

smcNames.forEach((name) => {
  const abiRaw = fs.readFileSync(`./sbin/${name}.abi.json`);
  const abi = JSON.parse(abiRaw);
  const image = fs.readFileSync(`./sbin/${name}.tvc`, { encoding: "base64" });

  fs.writeFileSync(
    `./ton-packages/${name}.package.ts`,
    `export default ${JSON.stringify({ abi, image })}`
  );
});

shell.exit(0);
