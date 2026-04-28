
import React, { useMemo, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { questionBank, sections } from "./data.js";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [selectedSection, setSelectedSection] = useState("all");
  const [questionCount, setQuestionCount] = useState("15");
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const available = useMemo(() => {
    return selectedSection === "all"
      ? questionBank
      : questionBank.filter((q) => q.section === selectedSection);
  }, [selectedSection]);

  const startQuiz = () => {
    const all = shuffleArray(available);
    const n = questionCount === "all" ? all.length : Math.min(Number(questionCount), all.length);
    setQuiz(all.slice(0, n));
    setCurrent(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    window.scrollTo(0, 0);
  };

  const choose = (opt) => {
    if (answered) return;
    setSelectedAnswer(opt);
    setAnswered(true);
    if (opt === quiz[current].answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= quiz.length) {
      setCurrent(current + 1);
    } else {
      setCurrent((c) => c + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      window.scrollTo(0, 0);
    }
  };

  if (quiz && current >= quiz.length) {
    return (
      <>
        <Analytics />
        <main className="page">
          <section className="hero result">
            <p className="eyebrow">Niðurstaða</p>
            <h1>{score} / {quiz.length}</h1>
            <p>Þú kláraðir prófið.</p>
            <button className="primary" onClick={() => setQuiz(null)}>Velja aftur</button>
          </section>
        </main>
      </>
    );
  }

  if (quiz) {
    const q = quiz[current];
    const progress = ((current + 1) / quiz.length) * 100;
    return (
      <>
        <Analytics />
        <main className="page quiz-page">
          <div className="topbar">
            <button className="ghost" onClick={() => setQuiz(null)}>↻ Hætta og velja aftur</button>
          </div>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <p className="muted">Spurning {current + 1} af {quiz.length}</p>
          <p className="section-label">{q.sectionLabel}</p>
          <article className="question-card">
            <div className="badges">
              <span>{q.type === "image-review" ? "MYND ÚR SKJALI" : q.options.length + " VALMÖGULEIKAR"}</span>
              <span>Rekstra II</span>
            </div>

            <h2>{q.prompt}</h2>

            {q.image && <img className="question-image" src={q.image} alt="Mynd með spurningu úr skjalinu" />}

            <div className="options">
              {q.options.map((opt) => {
                const isRight = opt === q.answer;
                const isPicked = opt === selectedAnswer;
                let cls = "option";
                if (answered && isRight) cls += " correct";
                if (answered && isPicked && !isRight) cls += " wrong";
                return (
                  <button key={opt} className={cls} onClick={() => choose(opt)}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="feedback">
                <strong>{selectedAnswer === q.answer ? "Rétt" : "Rangt"}</strong>
                {q.type === "image-review" ? (
                  <p>Þessi spurning er sett inn sem nákvæm mynd úr skjalinu, þannig að rétt svar sést á myndinni sjálfri.</p>
                ) : (
                  <p>Rétt svar: <b>{q.answer}</b></p>
                )}
                <button className="primary next" onClick={next}>
                  {current + 1 === quiz.length ? "Klára próf" : "Næsta spurning"}
                </button>
              </div>
            )}
          </article>
        </main>
      </>
    );
  }

  const selectedInfo = sections.find((s) => s.id === selectedSection);
  return (
    <>
      <Analytics />
      <main className="page">
        <section className="hero">
          <div>
            <p className="eyebrow">Rekstra II</p>
            <h1>Krossapróf úr skjalinu</h1>
            <p>Spurningarnar eru teknar úr skjalinu. Textaspurningarnar nota sömu valmöguleika og sama rétta svar og var merkt í skjalinu. Myndaspurningar eru birtar sem nákvæmar myndir úr skjalinu.</p>
          </div>
          <div className="stats">
            <strong>{questionBank.length}</strong>
            <span>spurningar/myndir</span>
          </div>
        </section>

        <section className="layout">
          <div className="panel">
            <h2>Veldu efni</h2>
            <div className="grid">
              {sections.map((s) => (
                <button
                  key={s.id}
                  className={selectedSection === s.id ? "tile active" : "tile"}
                  onClick={() => setSelectedSection(s.id)}
                >
                  <span className="badge">{s.count} sp.</span>
                  <b>{s.title}</b>
                  <small>{s.subtitle}</small>
                </button>
              ))}
            </div>
          </div>

          <aside className="panel setup">
            <h2>Stilla próf</h2>
            <label>Valinn hluti</label>
            <div className="selected-box">
              <b>{selectedInfo.title}</b>
              <span>Hámark {available.length} spurningar í þessu vali.</span>
            </div>
            <label>Fjöldi spurninga</label>
            <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}>
              <option value="10">10 spurningar</option>
              <option value="15">15 spurningar</option>
              <option value="25">25 spurningar</option>
              <option value="all">Allar spurningar</option>
            </select>
            <div className="notice">
              <b>Athugið</b>
              <p>Ég lét textaspurningarnar vera eins og þær eru í skjalinu, líka stafsetningu/innsláttarvillur, svo þetta passi við glósuskjalið þitt.</p>
            </div>
            <button className="primary" onClick={startQuiz}>Hefja próf</button>
          </aside>
        </section>
      </main>
    </>
  );
}
