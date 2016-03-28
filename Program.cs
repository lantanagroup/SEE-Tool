using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace generate_code
{
    class Program
    {
        //TODO: make more dynamic, perhaps pass these in via cmd line
        static string BasePath;

        static string BaseClientEnumPath = @"client\js\lib\internal\enum\";
        static string BaseServerEnumPath = @"Model\Enum\";
        static string BaseClientObjectPath = @"client\js\lib\internal\model\dto\";
        static string BaseServerObjectPath = @"Model\";


        static void Main(string[] args)
        {            
            BasePath = args[0];            
            GenerateEnums();
            GeneratePojos();
            GenerateMocks();
        }

        static T ReadConfig<T>(string aConfigFileName) 
            where T : class
        {
            T configClass = default(T);
            XmlSerializer serializer = new XmlSerializer(typeof(T));
            using (StreamReader reader = new StreamReader(aConfigFileName))
            {
                configClass = serializer.Deserialize(reader) as T;
            }

            return configClass;
        }

        static void GenerateEnums()
        {
            var clientFileName = Path.Combine(Program.BasePath, Program.BaseClientEnumPath, "enum.js");
            var serverFileName = Path.Combine(Program.BasePath, Program.BaseServerEnumPath, "enum.js");
            var enumConfig = ReadConfig <EnumConfig>("enum.xml");
            var clientTemplate = new generate_client_enum(enumConfig);
            System.IO.File.WriteAllText(clientFileName, clientTemplate.TransformText());
            var serverTemplate = new generate_server_enum(enumConfig);
            System.IO.File.WriteAllText(serverFileName, serverTemplate.TransformText());
        }

        static void GeneratePojos() 
        {
            var pojoConfig = ReadConfig<PojoConfig>("pojo.xml");
            var clientTemplate = new generate_pojo_client_object(pojoConfig);
            System.IO.File.WriteAllText(Path.Combine(Program.BasePath, Program.BaseClientObjectPath, "pojo.js"), clientTemplate.TransformText());
            var clientMapTemplate = new generate_pojo_client_object_mapping(pojoConfig);
            System.IO.File.WriteAllText(Path.Combine(Program.BasePath, Program.BaseClientObjectPath, "pojo_mapping.js"), clientMapTemplate.TransformText());
            //each server object is created in it's own file
            foreach (var pojo in pojoConfig.Pojos)
            {
                if (pojo.GenerateServer)
                {
                    var serverTemplate = new generate_pojo_server_object(pojo);
                    System.IO.File.WriteAllText(Path.Combine(Program.BasePath, Program.BaseServerObjectPath, string.Format("{0}.js", pojo.Name)), serverTemplate.TransformText());
                }
            }
        }

        static void GenerateMocks()
        {
            string contents = System.IO.File.ReadAllText("CCD 2 - 1.xml").Replace("\"", "'").Replace("\r","").Replace("\n"," ");
            var builder = new StringBuilder();
            builder.AppendLine("data = new SEE.model.dto.Document();");
            builder.AppendLine(" data.CdaXmlDocument.Xml = \"" + contents + "\";");
            builder.AppendLine(" data.DocumentInfo = new SEE.model.dto.DocumentInfo(); ");
            builder.AppendLine(" data.DocumentInfo.Title = \"Good Health Clinic: Health Summary\"");
            builder.AppendLine(" data.DocumentInfo.DateCreated = \"01/01/2013\"");
            builder.AppendLine(" data.DocumentInfo.DateModified = \"01/01/2013\"");
            builder.AppendLine(" data.DocumentInfo.Patient.FirstName = \"Jacob\"");
            builder.AppendLine(" data.DocumentInfo.Patient.LastName = \"Martin\"");
            builder.AppendLine(" data.Author = \"john.baker\"");
            builder.AppendLine(" data.DocumentInfo.GroupIdentifier = \"2\"");

            System.IO.File.WriteAllText("mock_pojo.js", builder.ToString());
        }

    }
}
