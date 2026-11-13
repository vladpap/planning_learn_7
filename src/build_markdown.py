"""Render the plan as a Markdown document for printing and quick reading.

The workbook stays the main deliverable; this text version repeats the same
data in a linear, printable form: calendar, monthly overview, week by week,
assessment points and sources.
"""

from pathlib import Path

import plan_data as data

OUTPUT_PATH = Path(__file__).resolve().parents[1] / "План_7_класс_2026-2027.md"

SOURCES = [
    ("Календарь 2026/2027 (Минпросвещения, рекомендации по каникулам)",
     "https://rg.ru/2026/07/08/minprosveshcheniya-opredelilo-sroki-shkolnyh-kanikul-na-budushchij-uchebnyj-god.html"),
    ("Федеральная рабочая программа «Литература», 5–9 классы",
     "https://nsportal.ru/shkola/literatura/library/2025/11/20/rabochaya-programma-po-literature"),
    ("Рабочая программа по алгебре, 7 класс (ФРП, тематическое планирование)",
     "https://rusembmnschool.ru/wp-content/uploads/2025/09/04.%D0%90%D0%BB%D0%B3%D0%B5%D0%B1%D1%80%D0%B0-7%D0%BA%D0%BB.pdf"),
    ("Рабочая программа по русскому языку, 7 класс",
     "https://a2b2.ru/storage/files/methodologicals/23807/26823_7klass.docx"),
]


def build_markdown():
    """Write the whole plan as one Markdown file."""
    lines = []
    add = lines.append

    add(f"# {data.SCHOOL_YEAR['title']}")
    add("")
    add("Семейное образование, пятидневная неделя, основные предметы. План составлен по "
        "федеральным рабочим программам для 7 класса и календарю 2026/2027 учебного года.")
    add("")
    add("| Параметр | Значение |")
    add("| --- | --- |")
    add(f"| Учебный год | {data.SCHOOL_YEAR['start']} — {data.SCHOOL_YEAR['end']} |")
    add(f"| Учебных недель | {data.SCHOOL_YEAR['weeks']} календарных, 34 полные, "
        f"{data.SCHOOL_YEAR['study_days']} учебных дня |")
    add(f"| Нагрузка | {data.SCHOOL_YEAR['weekly_hours']} уроков в неделю, 4–5 в день |")
    add("| Всего часов | 782 |")
    add("")

    add("## Каникулы")
    add("")
    add("| Каникулы | Даты | Длительность |")
    add("| --- | --- | --- |")
    for name, dates, length in data.VACATIONS:
        add(f"| {name} | {dates} | {length} |")
    add("")

    add("## Недельная нагрузка")
    add("")
    add("| Предмет | Уроков в неделю | Часов в год |")
    add("| --- | ---: | ---: |")
    for subject in data.SUBJECTS:
        add(f"| {subject['name']} | {subject['weekly_hours']} | {subject['annual']} |")
    add(f"| **Итого** | **{data.SCHOOL_YEAR['weekly_hours']}** | **782** |")
    add("")

    add("## План по месяцам")
    add("")
    for month in data.MONTHS:
        add(f"### {month}")
        add("")
        for subject in data.SUBJECTS:
            add(f"- **{subject['name']}.** {subject['monthly'][month]}")
        add("")

    add("## План по неделям")
    add("")
    weeks_by_number = {week["number"]: week for week in data.WEEKS}
    for week in data.WEEKS:
        add(f"### Неделя {week['number']} ({week['dates']}, {week['month']})")
        if week["note"]:
            add("")
            add(f"*{week['note']}.*")
        add("")
        for subject in data.SUBJECTS:
            add(f"- **{subject['name']}.** {subject['topics'][week['number']]}")
        if week["number"] in data.CONTROLS:
            add("")
            add("Контрольные:")
            for subject_name, form in data.CONTROLS[week["number"]]:
                add(f"- {subject_name}: {form}")
        add("")

    add("## Контрольные точки")
    add("")
    add("| Неделя | Даты | Предмет | Что проверяет |")
    add("| ---: | --- | --- | --- |")
    for week_number in sorted(data.CONTROLS):
        week = weeks_by_number[week_number]
        for subject_name, form in data.CONTROLS[week_number]:
            add(f"| {week_number} | {week['dates']} | {subject_name} | {form} |")
    add("")

    add("## Источники")
    add("")
    for title, url in SOURCES:
        add(f"- [{title}]({url})")
    add("")

    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"saved: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_markdown()
