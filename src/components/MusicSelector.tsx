import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Loader2 } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const MusicSelector = () => {
  const { tracks, isLoading, playTrack, currentTrackIndex, isPlaying } = useMusicPlayer();
  const [open, setOpen] = useState(false);

  const handleTrackSelect = (index: number) => {
    playTrack(index);
    setOpen(false);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Music className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Musique d'étude 🎵</h3>
            <p className="text-sm text-muted-foreground">
              {isPlaying 
                ? `En cours : ${tracks[currentTrackIndex]?.title.substring(0, 40)}...` 
                : "Choisis ta musique classique pour mieux te concentrer"}
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shrink-0">
              <Music className="w-4 h-4 mr-2" />
              {isPlaying ? "Changer" : "Choisir"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Choisis ta musique d'étude
              </DialogTitle>
              <DialogDescription>
                Sélectionne de la musique classique pour améliorer ta concentration pendant tes études
              </DialogDescription>
            </DialogHeader>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {tracks.map((track, index) => (
                    <button
                      key={`${track.id}-${index}`}
                      onClick={() => handleTrackSelect(index)}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors text-left ${
                        index === currentTrackIndex && isPlaying
                          ? "bg-primary/10 border-2 border-primary"
                          : "border-2 border-transparent"
                      }`}
                    >
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight mb-1">
                          {track.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Piste {index + 1} sur {tracks.length}
                        </p>
                      </div>
                      {index === currentTrackIndex && isPlaying ? (
                        <Music className="w-6 h-6 text-primary animate-pulse flex-shrink-0" />
                      ) : (
                        <Play className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
