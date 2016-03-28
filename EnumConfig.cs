using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace generate_code
{
    public class EnumConfig 
    {
        public EnumConfig()
        {
            this.Enums = new List<Enum>();
        }

        public List<Enum> Enums { get; set; }
    }

    public class Enum
    {
        public Enum()
        {
            this.Members = new List<EnumMember>();
            this.GenerateClient = true;
            this.GenerateServer = true;
        }

        [XmlAttribute()]
        public string Name { get; set; }

        [XmlAttribute()]
        public bool GenerateServer { get; set; }

        [XmlAttribute()]
        public bool GenerateClient { get; set; }

        public List<EnumMember> Members { get; set; }
    }

    public class EnumMember
    {
        [XmlAttribute()]
        public string Name { get; set; }

        [XmlAttribute()]
        public int Value { get; set; }
    }

}
