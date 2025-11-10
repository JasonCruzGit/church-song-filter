-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "category" TEXT,
    "lyrics_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Allowed',
    "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannedArtist" (
    "id" SERIAL NOT NULL,
    "artist_name" TEXT NOT NULL,

    CONSTRAINT "BannedArtist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannedArtist_artist_name_key" ON "BannedArtist"("artist_name");
