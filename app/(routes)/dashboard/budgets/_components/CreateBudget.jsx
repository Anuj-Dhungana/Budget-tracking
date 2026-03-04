"use client";

import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";

import { Button } from "../../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";
import { apiRequest } from "../../../../../lib/api.js";

function CreateBudget({ refershData }) {
  const [emojiicon, setEmojiicon] = useState("💰");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const onCreateBudget = async () => {
    try {
      setLoading(true);
      await apiRequest("/api/budgets", {
        method: "POST",
        body: {
          name,
          amount,
          icon: emojiicon,
        },
      });

      setName("");
      setAmount("");
      setEmojiicon("💰");
      setOpen(false);
      refershData();
      toast.success("Budget created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div
            className="bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-dashed cursor-pointer hover:shadow-md"
          >
            <h2 className="text-3xl font-bold">+</h2>
            <h2 className="text-2xl font-bold">Create New Budget</h2>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>

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
                  placeholder="e.g. Rs 5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              disabled={!(name && amount) || loading}
              onClick={onCreateBudget}
              className="mt-5 w-full"
            >
              {loading ? "Creating..." : "Create Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;
