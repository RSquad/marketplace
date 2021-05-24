import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";

export const createClient = (url = null) => {
  TonClient.useBinaryLibrary(libNode);
  return new TonClient({
    network: {
      server_address: process.env.NETWORK,
      network_retries_count: 10,
      message_retries_count: 10,
      message_processing_timeout: 120000,
      wait_for_timeout: 120000,
    },
  });
};
