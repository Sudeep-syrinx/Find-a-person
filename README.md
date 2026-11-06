# Nām: Find a Person

A name-lookup demo over **300,000 synthetic profiles**. Type a name and get a mock dossier with a generated reference ID, phone number, and simulated address.

> **All data in this project is synthetic.** Names, phone numbers, and addresses are generated for testing and demos. Any resemblance to real people is coincidental. This is not a real people-search tool.

## Features

- Search across 300,000 names
- Mock dossier with reference ID, phone structure, and simulated Indian address
- Built with TanStack Router and Vite

## Run locally

```bash
npm install
npm run dev
```

## Data

Profile data is stored in the `train-0000X-of-00002.parquet` files.

## License

No license specified yet.

## Run

```bash
cd local-nam
pip install -r requirements.txt
python app.py --rebuild   # builds directory.db once
python app.py
```

## Tests

```bash
cd local-nam
python -m pytest -v
```
