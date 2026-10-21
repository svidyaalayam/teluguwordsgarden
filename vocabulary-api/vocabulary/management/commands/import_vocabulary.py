import csv
import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from vocabulary.models import (
    LearningLevel,
    VocabularyCategory,
    Word,
)

# Telugu Unicode to IAST transliteration mapping
TELUGU_VOWELS = {
    0x0C05: 'a', 0x0C06: 'ā', 0x0C07: 'i', 0x0C08: 'ī',
    0x0C09: 'u', 0x0C0A: 'ū', 0x0C0B: 'ṛ', 0x0C60: 'ṝ',
    0x0C0C: 'ḷ', 0x0C61: 'ḹ', 0x0C0E: 'e', 0x0C0F: 'ē',
    0x0C10: 'ai', 0x0C12: 'o', 0x0C13: 'ō', 0x0C14: 'au',
}

TELUGU_CONSONANTS = {
    0x0C15: 'k', 0x0C16: 'kh', 0x0C17: 'g', 0x0C18: 'gh', 0x0C19: 'ṅ',
    0x0C1A: 'c', 0x0C1B: 'ch', 0x0C1C: 'j', 0x0C1D: 'jh', 0x0C1E: 'ñ',
    0x0C1F: 'ṭ', 0x0C20: 'ṭh', 0x0C21: 'ḍ', 0x0C22: 'ḍh', 0x0C23: 'ṇ',
    0x0C24: 't', 0x0C25: 'th', 0x0C26: 'd', 0x0C27: 'dh', 0x0C28: 'n',
    0x0C2A: 'p', 0x0C2B: 'ph', 0x0C2C: 'b', 0x0C2D: 'bh', 0x0C2E: 'm',
    0x0C2F: 'y', 0x0C30: 'r', 0x0C31: 'ṟ', 0x0C32: 'l', 0x0C33: 'ḷ',
    0x0C35: 'v', 0x0C36: 'ś', 0x0C37: 'ṣ', 0x0C38: 's', 0x0C39: 'h',
}

TELUGU_MATRAS = {
    0x0C3E: 'ā', 0x0C3F: 'i', 0x0C40: 'ī', 0x0C41: 'u',
    0x0C42: 'ū', 0x0C43: 'ṛ', 0x0C44: 'ṝ', 0x0C46: 'e',
    0x0C47: 'ē', 0x0C48: 'ai', 0x0C4A: 'o', 0x0C4B: 'ō',
    0x0C4C: 'au',
}

VIRAMA = 0x0C4D
ANUSVARA = 0x0C02
VISARGA = 0x0C03


def telugu_to_iast(text: str) -> str:
    """Converts Telugu Unicode text into standard IAST romanization."""
    if not text:
        return ""
    res = []
    i = 0
    n = len(text)
    while i < n:
        cp = ord(text[i])
        if cp in TELUGU_VOWELS:
            res.append(TELUGU_VOWELS[cp])
            i += 1
        elif cp in TELUGU_CONSONANTS:
            cons = TELUGU_CONSONANTS[cp]
            i += 1
            if i < n:
                ncp = ord(text[i])
                if ncp == VIRAMA:
                    res.append(cons)
                    i += 1
                elif ncp in TELUGU_MATRAS:
                    res.append(cons + TELUGU_MATRAS[ncp])
                    i += 1
                else:
                    res.append(cons + 'a')
            else:
                res.append(cons + 'a')
        elif cp == ANUSVARA:
            res.append('ṃ')
            i += 1
        elif cp == VISARGA:
            res.append('ḥ')
            i += 1
        elif cp == VIRAMA:
            i += 1
        else:
            res.append(text[i])
            i += 1
    return "".join(res)


class Command(BaseCommand):
    help = "Bulk import vocabulary words from a CSV or JSON file into the Word Garden database."

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str, help="Path to CSV or JSON file containing vocabulary.")
        parser.add_argument(
            "--default-category",
            type=str,
            default="సాధారణ పదాలు (General Words)",
            help="Default category to assign if missing in file.",
        )
        parser.add_argument(
            "--level",
            type=str,
            default="స్థాయి 1 (Beginner)",
            help="Learning level name to assign imported words.",
        )

    def handle(self, *args, **options):
        file_path = options["file_path"]
        default_category_name = options["default_category"]
        level_name = options["level"]

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        level, _ = LearningLevel.objects.get_or_create(
            name=level_name,
            defaults={"min_age": 5, "max_age": 12, "description": "Primary Telugu Vocabulary"},
        )

        records = []
        if file_path.endswith(".json"):
            with open(file_path, "r", encoding="utf-8") as f:
                records = json.load(f)
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                records = list(reader)

        self.stdout.write(f"Read {len(records)} entries from {file_path}. Processing...")

        created_count = 0
        updated_count = 0
        categories_cache = {}

        with transaction.atomic():
            for row in records:
                # Normalize keys (strip whitespace, lowercase)
                clean_row = {k.strip().lower() if k else "": v.strip() if v else "" for k, v in row.items()}
                
                term = clean_row.get("term") or clean_row.get("word") or clean_row.get("telugu") or ""
                if not term:
                    continue

                meaning = clean_row.get("meaning") or clean_row.get("english") or clean_row.get("definition") or ""
                category_name = clean_row.get("category") or default_category_name
                part_of_speech = clean_row.get("part_of_speech") or clean_row.get("pos") or "నామవాచకం • Noun"
                pronunciation = clean_row.get("pronunciation") or clean_row.get("iast") or telugu_to_iast(term)
                image_url = clean_row.get("image_url") or clean_row.get("image") or ""
                
                # Format bilingual definition
                definition = clean_row.get("definition") or ""
                if not definition:
                    definition = f"{meaning} • Telugu word for {meaning.lower()}." if meaning else term

                # Example sentences
                ex_te = clean_row.get("example_telugu") or clean_row.get("example_te") or ""
                ex_en = clean_row.get("example_english") or clean_row.get("example_en") or ""
                if ex_te and ex_en:
                    example_sentence = f"{ex_te} • {ex_en}"
                elif ex_te:
                    example_sentence = ex_te
                else:
                    example_sentence = clean_row.get("example_sentence") or f"మనం '{term}' పదాన్ని నేర్చుకుంటున్నాం. • We are learning the word '{term}'."

                # Get or create category
                if category_name not in categories_cache:
                    cat, _ = VocabularyCategory.objects.get_or_create(
                        name=category_name,
                        defaults={"active": True},
                    )
                    categories_cache[category_name] = cat
                category = categories_cache[category_name]

                word, created = Word.objects.update_or_create(
                    term=term,
                    defaults={
                        "definition": definition,
                        "part_of_speech": part_of_speech,
                        "pronunciation": pronunciation,
                        "example_sentence": example_sentence,
                        "image_url": image_url,
                        "active": True,
                    },
                )

                word.categories.add(category)
                word.levels.add(level)

                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Vocabulary import finished!\n"
                f"• Created new words: {created_count}\n"
                f"• Updated existing words: {updated_count}\n"
                f"• Total words now in database: {Word.objects.count()}\n"
                f"• Categories active: {VocabularyCategory.objects.count()}"
            )
        )
