"use client";

import React, { useState } from 'react'
import EmojiPicker from "emoji-picker-react"
import { PenBox } from "lucide-react"
import { toast } from "sonner"

import { Button } from "../../../../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog"
import { Input } from "../../../../../components/ui/input"
import { apiRequest } from "../../../../../lib/api.js"

function EditBudget({ budgetId, refreshData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [emojiicon, setEmojiicon] = useState("💰");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const getBudgetDetails = async () => {
    try {
      const data = await apiRequest(`/api/budgets/${budgetId}`, {
        cache: "no-store",
      });

      setName(data?.budget?.name || "");
      setAmount(data?.budget?.amount || "");
      setEmojiicon(data?.budget?.icon || "💰");
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
          name,
          amount,
          icon: emojiicon,
        },
      });

      toast.success("Budget updated successfully");
      refreshData && refreshData();
      setOpen(false);
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error(error.message || "Failed to update budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          void getBudgetDetails();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex gap-2 bg-[#00246B] text-white hover:bg-[#00246B]/90 rounded-md" variant="default">
          <PenBox />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>

          <div className="mt-4">
            <Button
              variant="outline"
              className="text-3xl"
              onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
            >
              {emojiicon}
            </Button>
            <div className="absolute z-20">
              {openEmojiPicker && (
                <EmojiPicker
                  onEmojiClick={(event) => {
                    setEmojiicon(event.emoji);
                    setOpenEmojiPicker(false);
                  }}
                />
              )}
            </div>
            <div className="mt-2">
              <h2 className="text-black font-medium my-2">Budget Name</h2>
              <Input
                placeholder="Budget Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <h2 className="text-black font-medium my-2">Budget Amount</h2>
              <Input
                type="number"
                placeholder="e.g Rs 5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            disabled={!(name && amount) || loading}
            onClick={updateBudget}
            className="mt-5 w-full"
          >
            {loading ? "Updating..." : "Update Budget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditBudget
