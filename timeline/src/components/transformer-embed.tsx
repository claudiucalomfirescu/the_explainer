"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { asset } from "@/lib/paths";

/**
 * The transformer explainer animation (REQ-14, ADR-003): a copied, self-contained page that loads
 * in an iframe only after the reader asks for it, so the card stays light (about 630 KB saved).
 */
export function TransformerEmbed() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-5">
      <h3 className="text-base font-semibold">Watch it: a transformer predicting the next word</h3>
      <p className="mt-1">A 110-second animation, from cutting the sentence into tokens to choosing the next word.</p>
      {playing ? (
        <iframe
          // The folder URL, not ".../index.html": some static servers redirect the latter to a
          // clean URL (the local `serve` answered 301), while every host serves a folder's index.
          src={asset("explainers/transformer/")}
          title="Animated explainer: how a transformer predicts the next word"
          className="mt-4 aspect-video w-full rounded-md border border-border bg-black"
          allow="fullscreen"
        />
      ) : (
        <Button type="button" data-testid="transformer-play" className="mt-4" onClick={() => setPlaying(true)}>
          <Play aria-hidden="true" />
          Play the animation
        </Button>
      )}
    </div>
  );
}
