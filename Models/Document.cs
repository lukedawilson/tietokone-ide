namespace CodeEditor.Models;

public class Document
{
    public List<string> Content { get; set; } = new();
    public override string ToString() => string.Join('\n', Content);

    public void Update(Update update)
    {
        switch (update.Action) {
            case "insert":
                if (update.Start.Row == Content.Count)
                {
                    Content.AddRange(update.Lines);
                }
                else if (update.Start.Row == update.End.Row)
                {
                    Content[update.Start.Row] = Content[update.Start.Row].Insert(update.Start.Column, update.Lines[0]);
                }
                else
                {
                    var remainder = Content[update.Start.Row].Substring(update.Start.Column);
                    Content[update.Start.Row] = Content[update.Start.Row].Substring(0, update.Start.Column) + update.Lines[0];
                    Content.InsertRange(update.Start.Row + 1, update.Lines.Skip(1));
                    Content[update.Start.Row + update.Lines.Length - 1] += remainder;
                }

                break;

            case "remove":
                if (update.Start.Row == update.End.Row)
                {
                    Content[update.Start.Row] = Content[update.Start.Row].Remove(update.Start.Column, update.End.Column - update.Start.Column);
                }
                else
                {
                    Content[update.Start.Row] = Content[update.Start.Row].Remove(update.Start.Column) + Content[update.End.Row].Substring(update.End.Column);
                    Content.RemoveRange(update.Start.Row + 1, update.End.Row - update.Start.Row);
                }

                break;
        }
    }
}

public record Update(Location Start, Location End, string Action, string[] Lines);
public record Location(int Row, int Column);
