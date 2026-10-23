# Portrait candidates for approval (Phase 3, REQ-12)

Found 2026-10-22 by `scripts/find_portraits.py`. Nothing has been downloaded. Source data:
`reports/portrait-candidates-202610222327.json`; contact sheet with Commons-hosted thumbnails:
`reports/portrait-candidates-202610222327.html` (screenshot `.png` beside it).

**How candidates were found.** Each candidate is the image that Wikidata's editors attached to
the person's Wikidata item (property P18), so the identity comes from Wikidata, not from a name
search. Licence, author and size come from the file's Commons record. Name searches were tried as
a fallback and rejected every hit after review (Donald Hebb returned a photo of Donald Rumsfeld,
Tom Brown a 1934 film actor, Ronald Williams a different Williams), so no search result is on this
list.

**Result:** 14 candidates for 31 people. I recommend 12 and advise against 2. The other 17
people have no freely licensed photo on Commons and keep the initials placeholder.

## Recommended (12)

| Person | Commons file | Author (credit line) | Licence | Size | Crop for the 80 × 100 card frame |
|---|---|---|---|---|---|
| Walter Pitts | [1954 Walter Pitts and a blackboard.jpg](https://commons.wikimedia.org/wiki/File:1954_Walter_Pitts_and_a_blackboard.jpg) | Francis Bello | Public domain | 733 × 1078 | head and shoulders (full-length photo) |
| Marvin Minsky | [Marvin Minsky at OLPCb (3x4 cropped).jpg](https://commons.wikimedia.org/wiki/File:Marvin_Minsky_at_OLPCb_%283x4_cropped%29.jpg) | Sethwoodworth (English Wikipedia) | CC BY 3.0 | 770 × 1025 | as is |
| Seymour Papert | [Papert.jpg](https://commons.wikimedia.org/wiki/File:Papert.jpg) | ak_mardini | CC BY-SA 2.0 | 170 × 198 | as is (small file, just enough for the frame) |
| John Hopfield | [John Hopfield 2016.jpg](https://commons.wikimedia.org/wiki/File:John_Hopfield_2016.jpg) | bhadeshia123 | CC BY 3.0 | 389 × 524 | as is |
| Geoffrey Hinton | [Geoffrey Hinton in 2026.jpg](https://commons.wikimedia.org/wiki/File:Geoffrey_Hinton_in_2026.jpg) | Cmichel67 | CC BY-SA 4.0 | 4131 × 5784 | as is (appears on five cards) |
| David Rumelhart | [DavidRumelhart-IJCNNseattle1991-07-08.jpg](https://commons.wikimedia.org/wiki/File:DavidRumelhart-IJCNNseattle1991-07-08.jpg) | Rolf Kickuth | CC BY-SA 4.0 | 2217 × 2560 | head and shoulders (half-length photo) |
| Sepp Hochreiter | [Sepp Hochreiter - Buch Wien 2025.JPG](https://commons.wikimedia.org/wiki/File:Sepp_Hochreiter_-_Buch_Wien_2025.JPG) | C.Stadler/Bwag | CC BY-SA 4.0 | 4200 × 3150 | centre on the face (landscape photo) |
| Jürgen Schmidhuber | [Jürgen Schmidhuber, 2017 (cropped).jpg](https://commons.wikimedia.org/wiki/File:J%C3%BCrgen_Schmidhuber%2C_2017_%28cropped%29.jpg) | ITU/R.Farrell | CC BY 2.0 | 2103 × 2975 | as is |
| Tomas Mikolov | [Tomáš Mikolov (2020).jpg](https://commons.wikimedia.org/wiki/File:Tom%C3%A1%C5%A1_Mikolov_%282020%29.jpg) | Jindřich Nosek (NoJin) | CC BY-SA 4.0 | 1024 × 1280 | as is |
| Kyunghyun Cho | [SD 2025 - Kyunghyun Cho 02 (cropped).jpg](https://commons.wikimedia.org/wiki/File:SD_2025_-_Kyunghyun_Cho_02_%28cropped%29.jpg) | Xuthoria | CC BY-SA 4.0 | 1841 × 2962 | as is |
| Yoshua Bengio | [Yoshua Bengio 2019 cropped.jpg](https://commons.wikimedia.org/wiki/File:Yoshua_Bengio_2019_cropped.jpg) | Maryse Boyce | CC BY 4.0 | 606 × 804 | as is |
| Jared Kaplan | [Jared Kaplan (cropped).jpg](https://commons.wikimedia.org/wiki/File:Jared_Kaplan_%28cropped%29.jpg) | TechCrunch | CC BY 2.0 | 852 × 902 | as is |

## Advised against (2)

| Person | Commons file | Why |
|---|---|---|
| Frank Rosenblatt | [Frank Rosenblatt.jpg](https://commons.wikimedia.org/wiki/File:Frank_Rosenblatt.jpg) | A 1950 photo by an unknown author, uploaded under CC BY-SA 4.0. The uploader is unlikely to hold the copyright, so the free licence is doubtful. Use only if you accept that risk. |
| Ilya Sutskever | [Ilya Sutskever and Sam Altman in TAU (cropped).jpg](https://commons.wikimedia.org/wiki/File:Ilya_Sutskever_and_Sam_Altman_in_TAU_%28cropped%29.jpg) | 192 × 287 pixels, seated, full length. At the card's 80 × 100 size the face would be a few pixels across. |

## No free photo found (17): initials placeholder

Warren McCulloch, Donald Hebb, Terry Sejnowski, David Ackley, Ronald Williams, Robert Jacobs,
Michael I. Jordan, Steven Nowlan, Noam Shazeer, Simon Osindero, Yee-Whye Teh, Alex Krizhevsky,
Dzmitry Bahdanau, Ashish Vaswani, Alec Radford, Tom Brown, Long Ouyang.

Checked: Wikidata image, the free lead image of the English Wikipedia article, a Commons
category under the person's name, and a Commons name search (all hits rejected after review).

## What happens after approval (Task 22)

1. Fetch each approved file as a Commons-generated thumbnail (about 640 px wide) from
   `upload.wikimedia.org`, so originals of up to 24 megapixels are not downloaded.
2. Crop as listed above and save a 320 × 400 JPEG under `public/images/people/<person-id>.jpg`,
   well under the 250 KB test limit.
3. Fill each person's `portrait` entry in `content/people.json` with file, author, licence,
   licence link and Commons page, as in the table. The schema accepts only these free licences.
4. Run the portrait tests (unit and browser), take screenshots, review and gate Phase 3.

## Owner decision

2026-10-22: "Approve the 12 recommended portraits; skip Rosenblatt and Sutskever. Download, crop,
credit and finish Phase 3." Rosenblatt and Sutskever keep the initials placeholder.

## Done (2026-10-23)

The 12 approved portraits are in `public/images/people/` (320 × 400 JPEG, 11.5 to 29 KB, metadata
stripped), cropped with the boxes in `scripts/portraits_approved.json`, and credited in
`content/people.json` from the Commons records. Built by `scripts/fetch_portraits.py`.
