using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace generate_code
{
    public enum PojoPropertyTypeCode { String, Number, Decimal, Date, Object, Boolean, Array };
    public enum ClientObservableCode { None, Observable, ObservableArray };

    public class PojoProperty {
        public PojoProperty()
        {
            this.PojoPropertyType = PojoPropertyTypeCode.String;
            this.ClientObservable = ClientObservableCode.None;
        }
        
        [XmlAttribute()]
        public string Name { get; set; }
        
        [XmlAttribute()]
        public PojoPropertyTypeCode PojoPropertyType { get; set; }
        
        [XmlAttribute()]
        public ClientObservableCode ClientObservable { get; set; }
        
        [XmlAttribute()]
        public string ClientDefaultValue { get; set; }
        
        [XmlAttribute()]
        public string ServerDefaultValue { get; set; }

        public string ToClientString()
        {
            var valueString = new StringBuilder();
            var defaultValue = string.IsNullOrEmpty(this.ClientDefaultValue) ? string.Empty : this.ClientDefaultValue;
            valueString.AppendFormat("self.{0} = ", this.Name);
            if (this.ClientObservable == ClientObservableCode.Observable)
            {
                valueString.AppendFormat("ko.observable({0})", defaultValue);
            }
            else if (this.ClientObservable == ClientObservableCode.ObservableArray)
            {
                valueString.AppendFormat("ko.observableArray([{0}])", defaultValue);
            }
            else if (this.ClientObservable == ClientObservableCode.None)
            {
                if (!string.IsNullOrEmpty(defaultValue))
                {
                    valueString.Append(defaultValue);
                }
                else
                {
                    switch (this.PojoPropertyType)
                    { 
                        case PojoPropertyTypeCode.Array:
                            valueString.Append("[]");
                            break;
                        case PojoPropertyTypeCode.Date:
                            valueString.Append("new Date()");
                            break;
                        case PojoPropertyTypeCode.Number:
                            valueString.Append("0");
                            break;
                        case PojoPropertyTypeCode.Decimal:
                            valueString.Append("0.00");
                            break;
                        case PojoPropertyTypeCode.Object:
                            valueString.Append("{}");
                            break;
                        case PojoPropertyTypeCode.String:
                            valueString.Append("''");
                            break;
                        case PojoPropertyTypeCode.Boolean:
                            valueString.Append("false");
                            break;
                        default:
                            throw new ArgumentException(string.Format("Invalid property code value of {0}.", this.PojoPropertyType));
                    }
                }
            }
            valueString.Append(";");
            return valueString.ToString();
        }

        public string ToServerString()
        {
            var valueString = new StringBuilder();
            var defaultValue = string.IsNullOrEmpty(this.ServerDefaultValue) ? string.Empty : this.ServerDefaultValue;
            valueString.AppendFormat("self.{0} = ", this.Name);
            if (!string.IsNullOrEmpty(defaultValue))
            {
                valueString.Append(defaultValue);
            }
            else
            {
                switch (this.PojoPropertyType)
                {
                    case PojoPropertyTypeCode.Array:
                        valueString.Append("[]");
                        break;
                    case PojoPropertyTypeCode.Date:
                        valueString.Append("new Date()");
                        break;
                    case PojoPropertyTypeCode.Number:
                        valueString.Append("0");
                        break;
                    case PojoPropertyTypeCode.Decimal:
                        valueString.Append("0.00");
                        break;
                    case PojoPropertyTypeCode.Object:
                        valueString.Append("{}");
                        break;
                    case PojoPropertyTypeCode.String:
                        valueString.Append("''");
                        break;
                    case PojoPropertyTypeCode.Boolean:
                        valueString.Append("false");
                        break;
                    default:
                        throw new ArgumentException(string.Format("Invalid property code value of {0}.", this.PojoPropertyType));
                }
            }
            valueString.Append(";");
            return valueString.ToString();
        }
    };


    public enum PojoServerIncludeFileType { Object, Enum };
    public class PojoServerIncludeFile
    {
        public PojoServerIncludeFile()
        {
        }


        [XmlAttribute()]
        public string VarName { get; set; }

        [XmlAttribute()]
        public string FileName { get; set; }

        [XmlAttribute()]
        public string FilePath { get; set; }

        [XmlAttribute()]
        public string MethodName { get; set; }

        [XmlAttribute()]
        public PojoServerIncludeFileType FileTypeCode { get; set; }

    };

    public class Pojo {
        public Pojo()
        {
            Properties = new List<PojoProperty>();
            ServerIncludeFiles = new List<PojoServerIncludeFile>();
            GenerateServer = true;
            GenerateClient = true;
        }

        [XmlAttribute("Name")]
        public string Name { get; set; }

        [XmlAttribute("GenerateClient")]
        public bool GenerateClient { get; set; }

        [XmlAttribute("GenerateServer")]
        public bool GenerateServer { get; set; }

        public List<PojoServerIncludeFile> ServerIncludeFiles { get; set; }

        public List<PojoProperty> Properties { get; set; }
    };

    public class PojoConfig
    {
        public PojoConfig()
        {
            Pojos = new List<Pojo>();
        }

        public List<Pojo> Pojos { get; set; }
    }
}
