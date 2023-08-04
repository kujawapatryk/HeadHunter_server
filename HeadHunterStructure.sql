-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 04, 2023 at 02:07 AM
-- Wersja serwera: 10.4.28-MariaDB
-- Wersja PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `super2`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `hrs`
--

CREATE TABLE `hrs` (
  `hrId` varchar(36) NOT NULL,
  `fullName` varchar(150) NOT NULL,
  `company` varchar(150) NOT NULL,
  `maxReservedStudents` int(3) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `registration_tokens`
--

CREATE TABLE `registration_tokens` (
  `userId` varchar(36) NOT NULL,
  `registrationToken` varchar(36) NOT NULL,
  `tokenExpiresOn` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `students`
--

CREATE TABLE `students` (
  `studentId` varchar(36) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `phoneNumber` varchar(25) DEFAULT NULL,
  `githubUsername` varchar(40) NOT NULL,
  `portfolioUrls` longtext DEFAULT NULL,
  `projectUrls` longtext DEFAULT NULL,
  `bio` varchar(600) DEFAULT NULL,
  `expectedTypeWork` int(1) DEFAULT NULL,
  `targetWorkCity` varchar(30) DEFAULT NULL,
  `expectedContractType` int(1) DEFAULT NULL,
  `expectedSalary` int(6) DEFAULT NULL,
  `canTakeApprenticeship` tinyint(1) NOT NULL DEFAULT 0,
  `monthsOfCommercialExp` int(3) NOT NULL DEFAULT 0,
  `education` text DEFAULT NULL,
  `workExperience` text DEFAULT NULL,
  `courses` text DEFAULT NULL,
  `userStatus` int(1) NOT NULL,
  `courseCompletion` int(1) NOT NULL,
  `courseEngagement` int(1) NOT NULL,
  `projectDegree` int(1) NOT NULL,
  `teamProjectDegree` int(1) NOT NULL,
  `bonusProjectUrls` varchar(255) NOT NULL,
  `reservedBy` varchar(36) DEFAULT NULL,
  `reservationExpiresOn` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `userId` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(80) NOT NULL,
  `authToken` varchar(512) DEFAULT NULL,
  `userState` int(1) NOT NULL DEFAULT 3
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `hrs`
--
ALTER TABLE `hrs`
  ADD PRIMARY KEY (`hrId`);

--
-- Indeksy dla tabeli `registration_tokens`
--
ALTER TABLE `registration_tokens`
  ADD PRIMARY KEY (`userId`);

--
-- Indeksy dla tabeli `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`studentId`),
  ADD UNIQUE KEY `githubUsername` (`githubUsername`),
  ADD KEY `reservedBy` (`reservedBy`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hrs`
--
ALTER TABLE `hrs`
  ADD CONSTRAINT `hrs_ibfk_1` FOREIGN KEY (`hrId`) REFERENCES `users` (`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `registration_tokens`
--
ALTER TABLE `registration_tokens`
  ADD CONSTRAINT `registration_tokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`reservedBy`) REFERENCES `hrs` (`hrId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `users` (`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
