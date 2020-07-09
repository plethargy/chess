CREATE TABLE Player
(
    [PlayerID] INT NOT NULL IDENTITY,
    [Name] VARCHAR(50) NOT NULL,
    [Surname] VARCHAR(50) NOT NULL,
    [Username] VARCHAR(50) NOT NULL,
    [Username] VARCHAR(50) NOT NULL,
    [CreatedOn] DATETIME2(0) NOT NULL DEFAULT GETDATE(),
    [LastPlayed] DATETIME2(0),
    [Score] FLOAT NOT NULL,
    PRIMARY KEY ([PlayerID])
);

CREATE TABLE Game
(
    [GameID] INT NOT NULL IDENTITY,
    [Player1_ID] INT NOT NULL,
    [Player2_ID] INT NOT NULL,
    [StartTime] DATETIME2(0) NOT NULL DEFAULT GETDATE(),
    [EndTime] DATETIME2(0) NOT NULL DEFAULT GETDATE(),
    [Player1_Score] FLOAT,
    [Player2_Score] FLOAT,
    [Player1_Colored] BINARY NOT NULL,
    [Player2_Colored] BINARY NOT NULL,
    [TimeLimitSet] BINARY NOT NULL,
    [SecondsLimit] int,
    PRIMARY KEY ([GameID])
);

CREATE TABLE Block
(
    [BlockID] INT NOT NULL IDENTITY,
    [BlockRow] INT NOT NULL,
    [BlockColumn] VARCHAR(1) NOT NULL,
    [BlockColoured] BINARY NOT NULL,
    PRIMARY KEY ([BlockID])
);

CREATE TABLE Piece
(
    [PieceID] INT NOT NULL IDENTITY,
    [PieceName] VARCHAR(50) NOT NULL,
    PRIMARY KEY ([PieceID])
);

CREATE TABLE Move
(
    [MoveID] INT NOT NULL IDENTITY,
    [PlayerID] INT NOT NULL,
    [GameID] INT NOT NULL,
    [PieceID] INT NOT NULL,
    [FromBlockID] INT NOT NULL,
    [ToBlockID] INT NOT NULL,
    [MoveTime] DATETIME2(0) NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY ([MoveID])
);

CREATE TABLE LeaderboardHistory
(
    [LeaderboardHistoryID] INT NOT NULL IDENTITY,
    [PlayerID] VARCHAR(50) NOT NULL,
    [PlayerScore] FLOAT NOT NULL,
    [ScoreDate] DATETIME2(0) NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY ([LeaderboardHistoryID])
);

INSERT INTO Piece (PieceName) VALUES ('King');
INSERT INTO Piece (PieceName) VALUES ('Queen');
INSERT INTO Piece (PieceName) VALUES ('Bishop');
INSERT INTO Piece (PieceName) VALUES ('Knight');
INSERT INTO Piece (PieceName) VALUES ('Rook');
INSERT INTO Piece (PieceName) VALUES ('Pawn');

