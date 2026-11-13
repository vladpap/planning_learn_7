"""Export the plan data as JSON for the static site.

Runs next to plan_data.py so the site and the Excel workbook always share one
source of truth. Writes site/src/data/plan.json.
"""

import json
import shutil
from pathlib import Path

import plan_data as data

OUTPUT_PATH = Path(__file__).resolve().parents[1] / "site" / "src" / "data" / "plan.json"

WEEKLY_SCHEDULE = [
    ("Понедельник", ["Русский язык", "Алгебра", "История", "Иностранный язык", "Биология"]),
    ("Вторник", ["Литература", "Геометрия", "Физика", "Русский язык"]),
    ("Среда", ["Алгебра", "Русский язык", "География", "Обществознание", "Иностранный язык"]),
    ("Четверг", ["Литература", "Геометрия", "Физика", "История"]),
    ("Пятница", ["Русский язык", "Алгебра", "География", "Иностранный язык",
                 "Вероятность и статистика"]),
]


def build_payload():
    """Collect every piece of data the site renders."""
    weeks_by_number = {week["number"]: week for week in data.WEEKS}

    controls = []
    for week_number in sorted(data.CONTROLS):
        week = weeks_by_number[week_number]
        for subject_name, form in data.CONTROLS[week_number]:
            controls.append({
                "week": week_number,
                "dates": week["dates"],
                "month": week["month"],
                "subject": subject_name,
                "form": form,
            })

    subjects = []
    for subject in data.SUBJECTS:
        subjects.append({
            "name": subject["name"],
            "weeklyHours": subject["weekly_hours"],
            "annualHours": subject["annual"],
            "focus": subject["focus"],
            "yearResult": subject["year_result"],
            "topics": {str(number): text for number, text in subject["topics"].items()},
            "monthly": subject["monthly"],
        })

    return {
        "schoolYear": data.SCHOOL_YEAR,
        "months": data.MONTHS,
        "weeks": [
            {
                "number": week["number"],
                "dates": week["dates"],
                "month": week["month"],
                "days": week["days"],
                "note": week["note"],
            }
            for week in data.WEEKS
        ],
        "subjects": subjects,
        "controls": controls,
        "vacations": [
            {"name": name, "dates": dates, "length": length}
            for name, dates, length in data.VACATIONS
        ],
        "schedule": [{"day": day, "lessons": lessons} for day, lessons in WEEKLY_SCHEDULE],
    }


MARKDOWN_SOURCE = Path(__file__).resolve().parents[1] / "План_7_класс_2026-2027.md"
MARKDOWN_TARGET = Path(__file__).resolve().parents[1] / "site" / "public" / "plan.md"


if __name__ == "__main__":
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(build_payload(), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    if MARKDOWN_SOURCE.exists():
        MARKDOWN_TARGET.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(MARKDOWN_SOURCE, MARKDOWN_TARGET)
        print(f"copied: {MARKDOWN_TARGET}")
    print(f"saved: {OUTPUT_PATH}")
