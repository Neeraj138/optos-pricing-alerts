import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "preact/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  getSupportedChains,
  getSupportedTokens,
  getCurrencies,
  getTokenPrice,
} from "@/lib/odosApi";
import AlertInputs from "../AlertInputs";

const PriceAlertUI = () => {
  const [selectedChain, setSelectedChain] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");

  const {
    data: chains,
    isLoading: isChainsLoading,
    error: isChainsError,
  } = useQuery({ queryKey: ["chains"], queryFn: getSupportedChains });

  const {
    data: tokens,
    isLoading: isTokensLoading,
    error: isTokensError,
    refetch: refetchTokens,
  } = useQuery({
    queryKey: ["tokens", selectedChain],
    queryFn: () => getSupportedTokens(selectedChain),
    enabled: selectedChain ? true : false,
  });

  const {
    data: currencies,
    isLoading: isCurrencyLoading,
    error: isCurrencyError,
  } = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });

  const {
    data: tokenPrice,
    isLoading: isPriceLoading,
    error: isPriceError,
  } = useQuery({
    queryKey: [
      "tokenPrice",
      selectedChain,
      selectedToken?.address,
      preferredCurrency,
    ],
    queryFn: () =>
      getTokenPrice(selectedChain, selectedToken?.address, preferredCurrency),
    refetchInterval: selectedToken ? 10000 : false,
    enabled: selectedToken ? true : false,
  });

  const handleSelectChain = (selectedChainId) => {
    setSelectedChain(selectedChainId);
    setSelectedToken(null);
    if (selectedChainId) refetchTokens();
  };

  const handleSetAlertCondition = (condition) => {
    setAlertCondition(condition);
    setAlertPercentage("");
    setAlertPrice(null);
  };

  const handleSetAlert = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId,
          selectedChain,
          selectedToken,
          preferredCurrency,
          alertCondition,
          alertPercentage,
          alertPrice,
        }),
      });

      if (response.ok) {
        alert("Alert set successfully!");
      } else {
        throw new Error("Failed to set alert.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to set alert. Please try again.");
    }
  };
  // Calculate alert price based on percentage input
  const calculateAlertPrice = (percentage) => {
    if (tokenPrice) {
      const percentageChange = (percentage / 100) * tokenPrice;
      let alertPrice;
      switch (alertCondition) {
        case ">":
          alertPrice = tokenPrice + percentageChange;
          break;
        case ">=":
          alertPrice = tokenPrice + percentageChange;
          break;
        case "==":
          alertPrice = tokenPrice; // Alert at current price
          break;
        case "<":
          alertPrice = tokenPrice - percentageChange;
          break;
        case "<=":
          alertPrice = tokenPrice - percentageChange;
          break;
        default:
          return null;
      }
      setAlertPrice(alertPrice); // Set alert price with two decimal places
    }
  };

  const handleAlertPercentageChange = (e) => {
    const value = e.target.value;
    setAlertPercentage(value);
    calculateAlertPrice(Number(value)); // Calculate alert price on percentage change
  };

  if (isChainsError || isTokensError) {
    return <>Error fetching chains/tokens</>;
  }

  const getSelectTokenComp = (isLoading, tokens) => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      );
    }
    return tokens && tokens.length > 0 ? (
      <Select onValueChange={setSelectedToken}>
        <SelectTrigger>
          <SelectValue placeholder="Select Token" />
        </SelectTrigger>
        <SelectContent>
          {tokens.map((token) => (
            <SelectItem key={token.address} value={token}>
              {`${token.name} (${token.symbol})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No tokens available" />
        </SelectTrigger>
      </Select>
    );
  };

  const getPreferredCurrency = (isCurrencyLoading, currencies) => {
    if (isCurrencyLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      );
    }
    return (
      <Select onValueChange={setPreferredCurrency}>
        <SelectTrigger>
          <SelectValue placeholder="Default is USD" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.id} value={currency.id}>
              {`${currency.id} (${currency.name})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  console.log(selectedChain, selectedToken, preferredCurrency);

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle>Crypto Price Alert</CardTitle>
        <CardDescription>
          Set up price alerts for your favorite tokens
        </CardDescription>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Chain</Label>

            {isChainsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ) : (
              <Select onValueChange={handleSelectChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.chainId} value={chain.chainId}>
                      {chain.chainData.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Token</Label>
            {getSelectTokenComp(isTokensLoading, tokens)}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Select Preferred Currency
            </Label>
            {getPreferredCurrency(isCurrencyLoading, currencies)}
          </div>
          <div className="p-4 bg-secondary rounded text-primary">
            <p className="text-sm text-zinc-400">Current Price</p>
            <p className="text-2xl font-bold">
              {tokenPrice ? `${preferredCurrency} ${tokenPrice}` : "--"}
            </p>
          </div>
          <AlertInputs
            selectedChain={selectedChain}
            selectedToken={selectedToken}
            preferredCurrency={preferredCurrency}
            tokenPrice={tokenPrice}
          />
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default PriceAlertUI;
