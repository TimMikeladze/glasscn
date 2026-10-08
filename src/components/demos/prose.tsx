import { Prose } from "@/components/glass/prose"

export default function ProseDemo() {
  return (
    <Prose>
      <h2>The method</h2>
      <p>
        Most days are forgettable. If nothing carries from one to the next, years pass without change. So each night, name what <strong>mattered</strong> and decide how it changes
        tomorrow. <a href="#">Read more</a>.
      </p>
      <blockquote>Keep the gains small. Let them compound.</blockquote>
      <h3>Each night</h3>
      <ol>
        <li>What was the most significant thing that happened today?</li>
        <li>How will it change what you do tomorrow?</li>
      </ol>
      <p>
        The carried answer is stored as <code>carryId</code>:
      </p>
      <pre>
        <code>{`const promise = entries[yesterday].answers[carryId]`}</code>
      </pre>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Nights</th>
            <th>Kept</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>40</td>
            <td>6</td>
            <td>83%</td>
          </tr>
          <tr>
            <td>41</td>
            <td>5</td>
            <td>71%</td>
          </tr>
        </tbody>
      </table>
    </Prose>
  )
}
