"use client";

import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { PenBox } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";
import { apiRequest } from "../../../../../lib/api.js";

function EditBudget({ budgetId, refreshData, trigger }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [emojiIcon, setEmojiIcon] = useState("\u{1F4B0}");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const getBudgetDetails = async () => {
    try {
      const data = await apiRequest(`/api/budgets/${budgetId}`, {
        cache: "no-store",
      });

      setName(data?.budget?.name || "");
      setAmount(String(data?.budget?.amount || ""));
      setEmojiIcon(data?.budget?.icon || "\u{1F4B0}");
    } catch (error) {
      console.error("Error fetching budget details:", error);
      toast.error(error.message || "Failed to load budget details");
    }
  };

  const updateBudget = async () => {
    try {
      setLoading(true);
      await apiRequest(`/api/budgets/${budgetId}`, {
        method: "PATCH",
        body: {
          name: name.trim(),
          amount: Number(amount),
          icon: emojiIcon,
        },
      });

      toast.success("Budget updated successfully");
      if (typeof refreshData === "function") {
        await refreshData();
      }
      setOpen(false);
      setOpenEmojiPicker(false);
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error(error.message || "Failed to update budget");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button
      className="flex gap-2 rounded-md bg-[#00246B] text-white hover:bg-[#00246B]/90"
      variant="default"
    >
      <PenBox className="h-4 w-4" />
      Edit
    </Button>
  );

  const isFormValid = name.trim() && Number(amount) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          void getBudgetDetails();
        } else {
          setOpenEmojiPicker(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update the budget details and keep your spending plan current.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="h-14 w-14 rounded-2xl p-0 text-3xl"
              onClick={() => setOpenEmojiPicker((currentValue) => !currentValue)}
            >
              {emojiIcon}
            </Button>
            {openEmojiPicker ? (
              <div className="absolute left-0 top-16 z-20">
                <EmojiPicker
                  onEmojiClick={(event) => {
                    setEmojiIcon(event.emoji);
                    setOpenEmojiPicker(false);
                  }}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Budget Name
            </label>
            <Input
              placeholder="Budget Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Budget Amount
            </label>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={!isFormValid || loading}
            onClick={updateBudget}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Budget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditBudget;
