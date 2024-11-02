import { CHAINID_METADATA } from "./Constants.js";
import { isValidArray, isValidObject } from "./globalUtils.js";

export const getSupportedChains = async () => {
  try {
    const response = await fetch("https://api.odos.xyz/info/chains", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching chains! Status: ${response.status}`);
    }
    const data = await response.json();
    if (isValidObject(data) && isValidArray(data.chains)) {
      const chainsData = data.chains.map((chainId) => {
        return {
          chainId: chainId,
          chainData: CHAINID_METADATA[chainId],
        };
      });
      return chainsData;
    } else {
      throw new Error("Invalid data structure or no supported chains found.");
    }
  } catch (error) {
    console.error("Error fetching supported chains:", error);
    return [];
  }
};

export const getSupportedTokens = async (chainId) => {
  try {
    const response = await fetch(
      "https://api.odos.xyz/info/tokens/" + chainId,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error fetching tokens! Status: ${response.status}`);
    }
    const data = await response.json();
    if (isValidObject(data) && isValidObject(data.tokenMap)) {
      const supportedTokens = [];
      Object.keys(data.tokenMap).forEach((tokenAddr) => {
        supportedTokens.push({
          symbol: data.tokenMap[tokenAddr].symbol,
          name: data.tokenMap[tokenAddr].name,
          address: tokenAddr,
        });
      });
      return supportedTokens;
    } else {
      throw new Error("Invalid data structure or no supported tokens found.");
    }
  } catch (error) {
    console.error("Error fetching supported tokens:", error);
    return [];
  }
};

// token - { symbol, address }
export const checkIfTokenIsSupported = (chainId, token) => {};

export const getCurrencies = async () => {
  try {
    const response = await fetch("https://api.odos.xyz/pricing/currencies", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching currencies! Status: ${response.status}`);
    }
    const data = await response.json();
    if (isValidObject(data) && isValidArray(data.currencies)) {
      return data.currencies;
    } else {
      throw new Error("Invalid data structure or no supported tokens found.");
    }
  } catch (error) {
    console.error("Error fetching supported tokens:", error);
    return [];
  }
};

export const getTokenPrice = async (chainId, tokenAddr, currencyId) => {
  try {
    const queryParams = new URLSearchParams({ currencyId: currencyId });
    const response = await fetch(
      `https://api.odos.xyz/pricing/token/${chainId}/${tokenAddr}?${queryParams}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error fetching token price! Status: ${response.status}`);
    }
    const data = await response.json();
    if (isValidObject(data)) {
      return data.price;
    } else {
      throw new Error("Invalid data structure or no supported tokens found.");
    }
  } catch (error) {
    console.error("Error fetching supported tokens:", error);
    return [];
  }
};
