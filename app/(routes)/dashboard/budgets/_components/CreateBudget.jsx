"use client";

import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Plus } from "lucide-react";
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

function CreateBudget({ refreshData, refershData, trigger }) {
  const onRefresh = refreshData || refershData;
  const [emojiIcon, setEmojiIcon] = useState("\u{1F4B0}");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleCreateBudget = async () => {
    try {
      setLoading(true);
      await apiRequest("/api/budgets", {
        method: "POST",
        body: {
          name: name.trim(),
          amount: Number(amount),
          icon: emojiIcon,
        },
      });

      setName("");
      setAmount("");
      setEmojiIcon("\u{1F4B0}");
      setOpenEmojiPicker(false);
      setOpen(false);

      if (typeof onRefresh === "function") {
        await onRefresh();
      }

      toast.success("Budget created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="gap-2 rounded-xl px-5">
      <Plus className="h-4 w-4" />
      Create Budget
    </Button>
  );

  const isFormValid = name.trim() && Number(amount) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setOpenEmojiPicker(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
          <DialogDescription>
            Add a new spending category and start tracking progress.
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
              placeholder="Food Budget"
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
            onClick={handleCreateBudget}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Budget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateBudget;
