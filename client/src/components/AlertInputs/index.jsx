import { useState } from "preact/hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";

const AlertInputs = ({
  selectedChain,
  selectedToken,
  preferredCurrency,
  tokenPrice,
}) => {
  const [alertCondition, setAlertCondition] = useState(">"); // Default to '>'
  const [alertPercentage, setAlertPercentage] = useState(""); // Input for alert percentage
  const [alertPrice, setAlertPrice] = useState(null); // Calculated alert price
  const [telegramId, setTelegramId] = useState("");

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

  const handleSetAlertCondition = (condition) => {
    setAlertCondition(condition);
    setAlertPercentage("");
    setAlertPrice(null);
  };
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
  return (
    <div>
      <div className="space-y-2 my-2">
        <Label className="text-sm font-medium">Alert Condition</Label>
        <Select onValueChange={handleSetAlertCondition}>
          <SelectTrigger>
            <SelectValue placeholder="Select Condition" />
          </SelectTrigger>
          <SelectContent>
            {[">", ">=", "==", "<", "<="].map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Alert Percentage</Label>
        <Input
          type="number"
          value={alertPercentage}
          onInput={handleAlertPercentageChange}
          placeholder="Enter percentage"
          min="0"
          step="0.01"
        />
        {tokenPrice && alertPrice !== null && (
          <p className="text-sm text-zinc-400">
            Alert Price: {preferredCurrency} {alertPrice}
          </p>
        )}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Telegram ID</Label>
          <Input
            placeholder="Enter your Telegram ID"
            value={telegramId}
            onInput={(e) => setTelegramId(e.target.value)}
          />
          <a 
                  href="https://t.me/userinfobot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 mt-1"
                >
                  Find your Telegram ID <ExternalLink className="h-3 w-3" />
                </a>
          <div className="flex justify-center">
            <button
              className="rounded bg-primary text-primary-foreground px-4 py-2 hover:bg-secondary hover:text-secondary-foreground disabled:bg-zinc-400 disabled:text-zinc-200"
              onClick={handleSetAlert}
              disabled={
                !(
                  selectedChain &&
                  selectedToken &&
                  preferredCurrency &&
                  alertPrice &&
                  telegramId
                )
              }
            >
              Set Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertInputs;
